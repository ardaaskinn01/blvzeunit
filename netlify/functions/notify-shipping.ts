import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from './services/email';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const emailService = new EmailService();

export const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Auth Check
        const authHeader = event.headers.authorization;
        if (!authHeader) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization header' }) };
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
        }

        // Check Admin Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // 2. Parse Body
        const { orderId, trackingNumber, trackingUrl, carrier } = JSON.parse(event.body || '{}');

        if (!orderId || !trackingNumber || !carrier) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        // 3. Get Order Details (for email)
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
        }

        // 4. Send Email
        await emailService.sendShippingNotification(order, trackingNumber, trackingUrl, carrier);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Notification sent' })
        };

    } catch (error: any) {
        console.error('Error sending notification:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
