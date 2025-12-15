import { Resend } from 'resend';

export class EmailService {
    private resend: Resend;
    private fromEmail: string;

    constructor() {
        this.resend = new Resend(process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY);
        this.fromEmail = 'info@blvzeunit.com'; // Resend domain
    }

    async sendOrderConfirmation(order: any) {
        if (!order.contact_info?.email) {
            console.warn('Order confirmation email skipped: No email found.');
            return;
        }

        try {
            const { first_name, last_name, email } = order.contact_info;

            const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1>Siparişiniz Alındı! 🚀</h1>
          <p>Merhaba ${first_name} ${last_name},</p>
          <p>Siparişiniz başarıyla alındı ve hazırlanmaya başlandı.</p>
          
          <div style="background: #f4f4f4; padding: 15px; margin: 20px 0;">
            <h3>Sipariş Özeti</h3>
            <p><strong>Sipariş No:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Tutar:</strong> ${order.total_amount} ${order.currency || 'TRY'}</p>
          </div>

          <h3>Teslimat Adresi:</h3>
          <p>
            ${order.shipping_address.address_line1}<br>
            ${order.shipping_address.city} / ${order.shipping_address.country || 'Turkey'}
          </p>

          <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
          <p><em>BLVZEUNIT Ekibi</em></p>
        </div>
      `;

            const data = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: `Sipariş Onayı #${order.id.slice(0, 8)} - BLVZEUNIT`,
                html: htmlContent,
            });

            console.log('Order confirmation email sent:', data.data?.id);
            return data;
        } catch (error) {
            console.error('Failed to send order confirmation email:', error);
            // Hata fırlatmıyoruz ki sipariş akışı bozulmasın, sadece logluyoruz.
            return null;
        }
    }
}
