import { Handler, HandlerResponse } from '@netlify/functions';
import Iyzipay from 'iyzipay';
import { createClient } from '@supabase/supabase-js';

// Initialize iyzico
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || '',
    secretKey: process.env.IYZICO_SECRET_KEY || '',
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const handler: Handler = async (event): Promise<HandlerResponse> => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { token } = JSON.parse(event.body || '{}');

        if (!token) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Payment token is required' }),
            };
        }

        // Retrieve checkout form result from iyzico
        return new Promise<HandlerResponse>((resolve) => {
            iyzipay.checkoutForm.retrieve(
                {
                    locale: Iyzipay.LOCALE.TR,
                    conversationId: token,
                    token: token,
                },
                async (err: any, result: any) => {
                    if (err) {
                        console.error('iyzico callback error:', err);
                        resolve({
                            statusCode: 500,
                            headers,
                            body: JSON.stringify({
                                error: 'Payment verification failed',
                                details: err
                            }),
                        });
                        return;
                    }

                    // Check payment status
                    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                        // Payment successful - update order in database
                        const orderId = result.basketId; // We used orderId as basketId

                        try {
                            // Update order status to 'paid'
                            const { error: updateError } = await supabase
                                .from('orders')
                                .update({
                                    status: 'paid',
                                    payment_id: result.paymentId,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', orderId);

                            if (updateError) {
                                console.error('Database update error:', updateError);
                                // Payment succeeded but DB update failed - log this for manual reconciliation
                            }

                            resolve({
                                statusCode: 200,
                                headers,
                                body: JSON.stringify({
                                    success: true,
                                    paymentStatus: 'SUCCESS',
                                    orderId: orderId,
                                    paymentId: result.paymentId,
                                    message: 'Ödemeniz başarıyla tamamlandı',
                                }),
                            });
                        } catch (dbError: any) {
                            console.error('Database error:', dbError);
                            resolve({
                                statusCode: 500,
                                headers,
                                body: JSON.stringify({
                                    success: false,
                                    error: 'Payment successful but order update failed',
                                    paymentId: result.paymentId,
                                }),
                            });
                        }
                    } else {
                        // Payment failed
                        resolve({
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: false,
                                paymentStatus: result.paymentStatus,
                                errorMessage: result.errorMessage || 'Ödeme işlemi başarısız',
                            }),
                        });
                    }
                }
            );
        });
    } catch (error: any) {
        console.error('Payment callback error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
        };
    }
};
