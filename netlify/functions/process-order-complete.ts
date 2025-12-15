import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { IyzicoService } from './services/iyzico';
import { ParasutService } from './services/parasut';
import { ShippingService } from './services/shipping';
import { EmailService } from './services/email';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const iyzicoService = new IyzicoService();
const parasutService = new ParasutService();
const shippingService = new ShippingService();
const emailService = new EmailService();

export const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 0. AUTHENTICATION CHECK
        const authHeader = event.headers.authorization;
        if (!authHeader) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization header' }) };
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
        }

        const { orderId } = JSON.parse(event.body || '{}');

        if (!orderId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'orderId is required' }) };
        }

        // 1. Siparişi çek
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
        }

        // AUTHORIZATION CHECK: Sadece sipariş sahibi veya Admin işlem yapabilir
        if (order.user_id !== user.id) {
            // Admin kontrolü
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized access to this order' }) };
            }
        }

        const steps = [];

        // 2. İyzico Ödeme Kontrolü (Mock)
        // Normalde burası callback'ten gelen token ile yapılır ama debug için
        // direkt başarılı bir sonuç simüle ediyoruz.
        const paymentResult = await iyzicoService.retrieveCheckoutFormResult('mock-token') as any;
        steps.push({ name: 'Iyzico Payment', result: paymentResult });

        if (paymentResult.status !== 'success') {
            throw new Error('Payment failed');
        }

        // 3. Paraşüt Fatura Oluşturma
        // Önce müşteri kaydı (varsa bul, yoksa oluştur)
        const parasutContact = await parasutService.createContact(order.contact_info);
        const invoice = await parasutService.createSalesInvoice(order, parasutContact.id);
        steps.push({ name: 'Parasut Invoice', result: invoice });

        // 4. Kargo Etiketi ve Takip Kodu
        const shipment = await shippingService.createShipment(order);
        const labelUrl = await shippingService.generateLabelPDF(order, shipment.trackingNumber);
        steps.push({ name: 'Shipping Label', result: { ...shipment, labelUrl } });

        // 5. Müşteriye Bilgilendirme Maili
        const emailResult = await emailService.sendOrderConfirmation(order);
        steps.push({ name: 'Email Notification', result: emailResult });

        // 5. Siparişi Güncelle
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'preparing', // veya shipped
                payment_status: 'paid',
                payment_id: paymentResult.paymentId,
                parasut_invoice_id: invoice.id,
                parasut_invoice_url: invoice.pdf_url,
                cargo_tracking_number: shipment.trackingNumber,
                cargo_tracking_url: shipment.trackingUrl,
                shipment_label_url: labelUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) {
            throw updateError;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Order processing debug flow completed',
                orderId,
                steps
            })
        };

    } catch (error: any) {
        console.error('Error processing order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
