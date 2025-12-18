import { Handler, HandlerResponse } from '@netlify/functions';
import Iyzipay from 'iyzipay';

// Initialize iyzico
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || '',
    secretKey: process.env.IYZICO_SECRET_KEY || '',
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com' // Use sandbox for testing
});

interface CheckoutFormRequest {
    orderId: string;
    basketId: string;
    price: string;
    paidPrice: string;
    currency: string;
    buyer: {
        id: string;
        name: string;
        surname: string;
        gsmNumber: string;
        email: string;
        identityNumber: string;
        registrationAddress: string;
        ip: string;
        city: string;
        country: string;
    };
    shippingAddress: {
        contactName: string;
        city: string;
        country: string;
        address: string;
    };
    billingAddress: {
        contactName: string;
        city: string;
        country: string;
        address: string;
    };
    basketItems: Array<{
        id: string;
        name: string;
        category1: string;
        itemType: string;
        price: string;
    }>;
}

export const handler: Handler = async (event): Promise<HandlerResponse> => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight
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
        const requestData: CheckoutFormRequest = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!requestData.price || !requestData.buyer || !requestData.basketItems) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        // Create checkout form initialization request
        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: requestData.orderId,
            price: requestData.price,
            paidPrice: requestData.paidPrice,
            currency: Iyzipay.CURRENCY.TRY,
            basketId: requestData.basketId,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${process.env.URL}/payment-callback`, // Netlify will set this
            enabledInstallments: [1, 2, 3, 6, 9, 12],
            buyer: requestData.buyer,
            shippingAddress: requestData.shippingAddress,
            billingAddress: requestData.billingAddress,
            basketItems: requestData.basketItems,
        };

        // Initialize checkout form
        return new Promise<HandlerResponse>((resolve) => {
            iyzipay.checkoutFormInitialize.create(request as any, (err: any, result: any) => {
                if (err) {
                    console.error('iyzico error:', err);
                    resolve({
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({
                            error: 'Payment initialization failed',
                            details: err
                        }),
                    });
                } else if (result.status !== 'success') {
                    console.error('iyzico failed:', result);
                    resolve({
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            error: 'Payment initialization failed',
                            details: result.errorMessage
                        }),
                    });
                } else {
                    resolve({
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            token: result.token,
                            checkoutFormContent: result.checkoutFormContent,
                            paymentPageUrl: result.paymentPageUrl,
                        }),
                    });
                }
            });
        });
    } catch (error: any) {
        console.error('Payment initialization error:', error);
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
