import { Handler, HandlerResponse } from '@netlify/functions';
import Iyzipay from 'iyzipay';
import { validateEnvironment } from './utils/env-validator';
import { withRetry } from './utils/retry';
import { checkRateLimit, getClientIP } from './utils/rate-limiter';
import { logError, trackPaymentMetric, ErrorSeverity } from './utils/monitoring';

interface ThreeDSPaymentRequest {
    orderId: string;
    price: string;
    paidPrice: string;
    currency: string;
    basketId: string;
    paymentGroup: string;
    callbackUrl: string;
    installment?: number;
    buyer: {
        id: string;
        name: string;
        surname: string;
        identityNumber: string;
        email: string;
        gsmNumber: string;
        registrationAddress: string;
        city: string;
        country: string;
        ip: string;
        zipCode?: string;
        registrationDate?: string;
        lastLoginDate?: string;
    };
    shippingAddress: {
        contactName: string;
        city: string;
        country: string;
        address: string;
        zipCode?: string;
    };
    billingAddress: {
        contactName: string;
        city: string;
        country: string;
        address: string;
        zipCode?: string;
    };
    basketItems: Array<{
        id: string;
        name: string;
        category1: string;
        itemType: string;
        price: string;
    }>;
    paymentCard: {
        cardHolderName: string;
        cardNumber: string;
        expireYear: string;
        expireMonth: string;
        cvc: string;
        registerCard?: number;
    };
}

export const handler: Handler = async (event): Promise<HandlerResponse> => {
    // Environment validation - startup check
    try {
        validateEnvironment();
    } catch (error: any) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Configuration Error',
                message: error.message
            }),
        };
    }

    // Environment-aware CORS Configuration
    const headers: { [header: string]: string } = process.env.NODE_ENV === 'production'
        ? {
            'Access-Control-Allow-Origin': process.env.SITE_URL!,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
        : {
            'Access-Control-Allow-Origin': '*', // Development: easy testing
            'Access-Control-Allow-Credentials': 'false',
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

    // Rate limiting (10 requests per minute per IP)
    const clientIP = getClientIP(event.headers);
    const rateLimit = checkRateLimit(clientIP, { maxRequests: 10, windowMs: 60000 });

    if (!rateLimit.allowed) {
        await logError(
            `Rate limit exceeded for IP: ${clientIP}`,
            ErrorSeverity.MEDIUM,
            { service: 'payment', function: 'create-payment', metadata: { ip: clientIP } }
        );

        return {
            statusCode: 429,
            headers: {
                ...headers,
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            },
            body: JSON.stringify({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
            }),
        };
    }

    try {
        const requestData: ThreeDSPaymentRequest = JSON.parse(event.body || '{}');

        // Track payment initiation
        trackPaymentMetric('payment_initiated', {
            orderId: requestData.orderId,
            amount: requestData.paidPrice,
            currency: requestData.currency,
        });

        // Iyzipay SDK instance oluştur
        const iyzipay = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY!,
            secretKey: process.env.IYZICO_SECRET_KEY!,
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });

        // SDK için request objesi
        const iyzicoRequest = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: requestData.orderId,
            price: requestData.price,
            paidPrice: requestData.paidPrice,
            currency: Iyzipay.CURRENCY.TRY,
            basketId: requestData.basketId,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            callbackUrl: process.env.PAYMENT_CALLBACK_URL || `${process.env.SITE_URL || 'http://localhost:8888'}/.netlify/functions/payment-callback`,
            enabledInstallments: [1],
            installment: requestData.installment || 1,
            buyer: {
                id: requestData.buyer.id,
                name: requestData.buyer.name,
                surname: requestData.buyer.surname,
                gsmNumber: formatGsmNumber(requestData.buyer.gsmNumber),
                email: requestData.buyer.email,
                identityNumber: requestData.buyer.identityNumber,
                registrationAddress: requestData.buyer.registrationAddress,
                ip: isValidIp(requestData.buyer.ip) ? requestData.buyer.ip : clientIP,
                city: requestData.buyer.city,
                country: requestData.buyer.country,
                zipCode: requestData.buyer.zipCode
            },
            shippingAddress: {
                contactName: requestData.shippingAddress.contactName,
                city: requestData.shippingAddress.city,
                country: requestData.shippingAddress.country,
                address: requestData.shippingAddress.address,
                zipCode: requestData.shippingAddress.zipCode
            },
            billingAddress: {
                contactName: requestData.billingAddress.contactName,
                city: requestData.billingAddress.city,
                country: requestData.billingAddress.country,
                address: requestData.billingAddress.address,
                zipCode: requestData.billingAddress.zipCode
            },
            basketItems: requestData.basketItems.map(item => ({
                id: item.id,
                name: item.name,
                category1: item.category1,
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: item.price
            })),
            paymentCard: {
                cardHolderName: requestData.paymentCard.cardHolderName,
                cardNumber: requestData.paymentCard.cardNumber,
                expireMonth: requestData.paymentCard.expireMonth,
                expireYear: requestData.paymentCard.expireYear,
                cvc: requestData.paymentCard.cvc,
                registerCard: 0
            }
        };

        console.log('Calling Iyzico 3DS API with request:', sanitizeForLog(iyzicoRequest));

        // SDK ile 3DS Initialize (with retry)
        return new Promise((resolve) => {
            // Retry wrapper for Iyzico SDK call
            withRetry(
                () => new Promise<any>((innerResolve, innerReject) => {
                    iyzipay.threedsInitialize.create(iyzicoRequest as any, (err: any, result: any) => {
                        if (err) {
                            innerReject(err);
                        } else {
                            innerResolve(result);
                        }
                    });
                }),
                { maxRetries: 3, initialDelay: 1000 }
            )
                .then((result) => {
                    console.log('Iyzico 3DS Response (sanitized):', sanitizeForLog(result));

                    if (result.status === 'success') {
                        resolve({
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: true,
                                threeDSHtmlContent: result.threeDSHtmlContent,
                                paymentId: result.paymentId,
                            }),
                        });
                    } else {
                        resolve({
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({
                                error: 'Payment Initialization Failed',
                                message: result.errorMessage,
                                errorCode: result.errorCode
                            }),
                        });
                    }
                })
                .catch((err) => {
                    console.error('Iyzico SDK Error for request:', sanitizeForLog(iyzicoRequest), 'Error:', err);
                    resolve({
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({
                            error: 'Payment SDK Error',
                            message: err.message || 'Unknown error'
                        }),
                    });
                });
        });
    } catch (error: any) {
        console.error('3DS payment error:', error);

        await logError(
            error,
            ErrorSeverity.CRITICAL,
            {
                service: 'payment',
                function: 'create-payment',
                metadata: { errorType: error.name, errorMessage: error.message }
            }
        );

        trackPaymentMetric('payment_failed', {
            error: error.message,
            errorType: error.name,
        });

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            }),
        };
    }

    function sanitizeForLog(obj: any) {
        if (!obj) return obj;

        // Orijinal objeyi bozmamak için kopyasını oluşturuyoruz
        const sanitized = JSON.parse(JSON.stringify(obj));

        if (sanitized.paymentCard) {
            sanitized.paymentCard = {
                ...sanitized.paymentCard,
                // Kartın sadece son 4 hanesini bırak, geri kalanı maskele
                cardNumber: '****-****-****-' + (sanitized.paymentCard.cardNumber?.toString().slice(-4) || '****'),
                // CVC'yi tamamen gizle
                cvc: '***',
                // expireMonth/Year bilgisi genellikle maskelenmez ama isterseniz ekleyebilirsiniz
            };
        }
        return sanitized;
    }
};

function formatGsmNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Remove leading '0' if present (11 digits case: 0555...)
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }

    // Remove leading '90' if present (12 digits case: 90555...)
    if (cleaned.length === 12 && cleaned.startsWith('90')) {
        cleaned = cleaned.substring(2);
    }

    // Ensure it starts with +90 and has 10 digits
    // Iyzico expects format like +905551234567
    if (cleaned.length === 10) {
        return `+90${cleaned}`;
    }

    // Return original if we can't parse it confidently, 
    // but try to prepend + if it looks like a full number (e.g. 90555...)
    if (phone.startsWith('90') && phone.length === 12) {
        return `+${phone}`;
    }

    return phone.startsWith('+') ? phone : `+${phone}`;
}

function isValidIp(ip: string): boolean {
    if (!ip) return false;
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return false;
    // Simple regex for IPv4
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    // Basic check, allows IPv6 too if needed but mainly filters out empty/localhost
    return ipv4Regex.test(ip) || ip.includes(':');
}
