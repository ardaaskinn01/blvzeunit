import Iyzipay from 'iyzipay';

export class IyzicoService {
    private iyzipay: any;

    constructor() {
        this.iyzipay = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY || 'sandbox-key',
            secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret',
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });
    }

    /**
     * Ödeme Formunu Başlatır (Checkout Initialize)
     */
    async initializeCheckoutForm(order: any, callbackUrl: string) {
        return new Promise((resolve, reject) => {
            const request = {
                locale: Iyzipay.LOCALE.TR,
                conversationId: order.id,
                price: order.total_amount.toString(),
                paidPrice: order.total_amount.toString(),
                currency: Iyzipay.CURRENCY.TRY,
                basketId: order.id,
                paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
                callbackUrl: callbackUrl,
                enabledInstallments: [2, 3, 6, 9],
                buyer: {
                    id: order.user_id,
                    name: order.contact_info.first_name || 'Misafir',
                    surname: order.contact_info.last_name || 'Kullanıcı',
                    gsmNumber: order.contact_info.phone || '+905555555555',
                    email: order.contact_info.email,
                    identityNumber: '11111111111',
                    lastLoginDate: '2015-10-05 12:43:35',
                    registrationAddress: order.shipping_address.address_line1,
                    registrationDate: '2013-04-21 15:12:09',
                    ip: '85.85.85.85',
                    city: order.shipping_address.city,
                    country: order.shipping_address.country || 'Turkey',
                    zipCode: order.shipping_address.zip_code || '34732'
                },
                shippingAddress: {
                    contactName: `${order.contact_info.first_name} ${order.contact_info.last_name}`,
                    city: order.shipping_address.city,
                    country: order.shipping_address.country || 'Turkey',
                    address: order.shipping_address.address_line1,
                    zipCode: order.shipping_address.zip_code || '34732'
                },
                billingAddress: {
                    contactName: `${order.contact_info.first_name} ${order.contact_info.last_name}`,
                    city: order.shipping_address.city,
                    country: order.shipping_address.country || 'Turkey',
                    address: order.shipping_address.address_line1,
                    zipCode: order.shipping_address.zip_code || '34732'
                },
                basketItems: order.items?.map((item: any) => ({
                    id: item.product_id,
                    name: item.product_name || 'Urun',
                    category1: 'Giyim',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price: item.unit_price.toString()
                })) || []
            };

            this.iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Ödeme Sonucunu (Token ile) Sorgular
     */
    async retrieveCheckoutFormResult(token: string) {
        return new Promise((resolve, reject) => {
            this.iyzipay.checkoutForm.retrieve({
                locale: Iyzipay.LOCALE.TR,
                token: token
            }, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
