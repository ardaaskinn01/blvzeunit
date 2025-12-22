import { Handler, HandlerResponse } from '@netlify/functions';
import Iyzipay from 'iyzipay';
import * as querystring from 'querystring';
import { validateEnvironment } from './utils/env-validator';
import { getSupabaseClient } from './utils/supabase-client';
import { withRetry } from './utils/retry';
import { logError, trackPaymentMetric, ErrorSeverity } from './utils/monitoring';

// Supabase client (singleton)
const supabase = getSupabaseClient();

// Site URL (Frontend Redirect için)
const SITE_URL = process.env.SITE_URL || 'http://localhost:8888';

export const handler: Handler = async (event): Promise<HandlerResponse> => {
    // Environment validation - startup check
    try {
        validateEnvironment();
    } catch (error: any) {
        console.error('Environment validation failed:', error.message);
        return {
            statusCode: 500,
            body: 'Configuration Error',
        };
    }

    // Sadece POST kabul et (Iyzico POST döner)
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        // Iyzico application/x-www-form-urlencoded gönderir
        const bodyParams = querystring.parse(event.body || '');
        console.log('Iyzico Callback Body:', bodyParams);

        const paymentId = bodyParams.paymentId as string;
        const conversationId = bodyParams.conversationId as string;
        const status = bodyParams.status as string;

        if (!paymentId) {
            console.error('Payment ID missing in callback');
            return {
                statusCode: 302,
                headers: {
                    Location: `${SITE_URL}/payment-callback?status=failure&message=Payment ID missing`,
                },
                body: '',
            };
        }

        // Eğer Iyzico zaten hata döndüyse (status !== success)
        if (status !== 'success') {
            return {
                statusCode: 302,
                headers: {
                    Location: `${SITE_URL}/payment-callback?status=failure&message=Iyzico returned failure status`,
                },
                body: '',
            };
        }


        // Iyzipay SDK instance oluştur
        const iyzipay = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY!,
            secretKey: process.env.IYZICO_SECRET_KEY!,
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });

        const iyzicoRequest = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: conversationId,
            paymentId: paymentId
        };

        console.log('Calling iyzico 3DS Auth with SDK for Payment ID:', paymentId);

        // SDK ile 3DS Auth (with retry)
        return new Promise((resolve) => {
            withRetry(
                () => new Promise<any>((innerResolve, innerReject) => {
                    iyzipay.threedsPayment.create(iyzicoRequest, (err: any, result: any) => {
                        if (err) {
                            innerReject(err);
                        } else {
                            innerResolve(result);
                        }
                    });
                }),
                { maxRetries: 3, initialDelay: 1000 }
            )
                .then(async (result) => {
                    console.log('Iyzico 3DS Auth Response:', result);

                    if (result.status === 'success') {
                        if (conversationId) {
                            // 1. & 2. ADIM: Siparişi Güncelle ve Güncel Veriyi Anında Çek (Atomic Update)
                            const { error: updateError, data: updatedOrder } = await supabase
                                .from('orders')
                                .update({
                                    payment_status: 'paid',
                                    status: 'preparing',
                                    iyzico_payment_id: result.paymentId,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', conversationId)
                                .select() // Güncellenen datayı geri döndürür
                                .single(); // Tek bir satır beklediğimizi belirtir

                            // KRİTİK HATA: Ödeme başarılı ama DB güncellenemedi
                            if (updateError) {
                                console.error('CRITICAL: Order update failed after successful payment:', updateError);

                                await logError(
                                    `Order update failed after successful payment. Payment ID: ${result.paymentId}`,
                                    ErrorSeverity.CRITICAL,
                                    {
                                        service: 'payment',
                                        function: 'payment-callback',
                                        orderId: conversationId,
                                        paymentId: result.paymentId,
                                        metadata: { error: updateError.message }
                                    }
                                );

                                return resolve({
                                    statusCode: 302,
                                    headers: {
                                        Location: `${SITE_URL}/payment-callback?status=error&message=Payment successful but order update failed. Please contact support with Payment ID: ${result.paymentId}`,
                                    },
                                    body: '',
                                });
                            }

                            // Track successful payment
                            trackPaymentMetric('payment_success', {
                                orderId: conversationId,
                                paymentId: result.paymentId,
                            });

                            // 3. ADIM: E-posta Gönder (Atomic işlem dışında, non-blocking)
                            if (updatedOrder) {
                                try {
                                    // Not: EmailService'i dosyanın en başında import etmeniz önerilir
                                    const { EmailService } = require('./services/email');
                                    const emailService = new EmailService();
                                    await emailService.sendOrderConfirmation(updatedOrder);
                                    console.log('Confirmation email triggered for order:', conversationId);
                                } catch (emailErr) {
                                    // Email hatası kritik değildir, akışı bozmamalı
                                    console.error('Email sending failed (non-critical):', emailErr);
                                }
                            }
                        }

                        // BAŞARILI REDIRECT
                        return resolve({
                            statusCode: 302,
                            headers: {
                                Location: `${SITE_URL}/payment-callback?status=success&paymentId=${result.paymentId}`,
                            },
                            body: '',
                        });

                    } else {
                        // BAŞARISIZ ÖDEME BLOĞU
                        if (conversationId) {
                            await supabase
                                .from('orders')
                                .update({
                                    payment_status: 'failed',
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', conversationId);
                        }

                        return resolve({
                            statusCode: 302,
                            headers: {
                                Location: `${SITE_URL}/payment-callback?status=failure&message=${encodeURIComponent(result.errorMessage || 'Unknown failure')}`,
                            },
                            body: '',
                        });
                    }
                })
                .catch((err) => {
                    console.error('Iyzico SDK Auth Error:', err);
                    resolve({
                        statusCode: 302,
                        headers: {
                            Location: `${SITE_URL}/payment-callback?status=failure&message=${encodeURIComponent(err.message || 'SDK Error')}`,
                        },
                        body: '',
                    });
                });
        });
    } catch (error: any) {
        console.error('3DS callback error:', error);
        return {
            statusCode: 302,
            headers: {
                Location: `${SITE_URL}/payment-callback?status=failure&message=${encodeURIComponent(error.message || 'Internal Server Error')}`,
            },
            body: '',
        };
    }
};
