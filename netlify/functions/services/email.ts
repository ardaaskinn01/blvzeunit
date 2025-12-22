import { Resend } from 'resend';

export class EmailService {
    private resend: Resend;
    private fromEmail: string;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY!);
        this.fromEmail = 'info@blvzeunit.com'; // Resend domain
    }

    async sendOrderConfirmation(order: any) {
        if (!order.contact_info?.email) {
            console.warn('Order confirmation email skipped: No email found.');
            return;
        }

        try {
            // contact_info sadece email ve phone içeriyor. İsim shipping_address içinde.
            const { email } = order.contact_info;
            const fullName = order.shipping_address?.full_name || 'Değerli Müşterimiz';

            const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1>Siparişiniz Alındı! 🚀</h1>
          <p>Merhaba ${fullName},</p>
          <p>Siparişiniz başarıyla alındı ve hazırlanmaya başlandı.</p>
          
          <div style="background: #f4f4f4; padding: 15px; margin: 20px 0;">
            <h3>Sipariş Özeti</h3>
            <p><strong>Sipariş No:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Tutar:</strong> ${order.total_amount} ${order.currency || 'TRY'}</p>
          </div>

          <h3>Teslimat Adresi:</h3>
          <p>
            ${order.shipping_address.address}<br>
            ${order.shipping_address.city} / ${order.shipping_address.country || 'Turkey'}
          </p>

          <div style="background: #e7f3ff; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff; border-radius: 4px;">
            <p style="margin: 0;"><strong> Bilgilendirme:</strong> Siparişiniz kargoya verildiğinde, kargo takip numaranızı içeren ayrı bir e-posta alacaksınız.</p>
          </div>

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

    async sendShippingNotification(order: any, trackingNumber: string, trackingUrl: string | null, carrier: string) {
        if (!order.contact_info?.email) {
            console.warn('Shipping notification email skipped: No email found.');
            return;
        }

        try {
            // contact_info sadece email ve phone içeriyor. İsim shipping_address içinde.
            const { email } = order.contact_info;
            const fullName = order.shipping_address?.full_name || 'Değerli Müşterimiz';

            const trackingLinkHtml = trackingUrl
                ? `<p>Kargonuzu takip etmek için <a href="${trackingUrl}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">buraya tıklayın</a>.</p>`
                : '';

            const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1>Siparişiniz Kargoya Teslim Edildi! 📦</h1>
          <p>Merhaba ${fullName},</p>
          <p>Siparişiniz (#${order.id.slice(0, 8)}) hazırlanmış ve kargo firmasına teslim edilmiştir.</p>
          
          <div style="background: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Kargo Bilgileri</h3>
            <p><strong>Kargo Firması:</strong> ${carrier}</p>
            <p><strong>Takip Numarası:</strong> ${trackingNumber}</p>
            ${trackingLinkHtml}
          </div>

          <p>Ürünlerinizin size en kısa sürede ulaşmasını dileriz.</p>
          <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
          <p><em>BLVZEUNIT Ekibi</em></p>
        </div>
      `;

            const data = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: `Siparişiniz Kargolandı 📦 #${order.id.slice(0, 8)} - BLVZEUNIT`,
                html: htmlContent,
            });

            console.log('Shipping notification email sent:', data.data?.id);
            return data;
        } catch (error) {
            console.error('Failed to send shipping notification email:', error);
            return null;
        }
    }
}
