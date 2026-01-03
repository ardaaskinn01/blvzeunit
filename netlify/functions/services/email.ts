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
            ${order.shipping_address.city} / ${order.shipping_address.country || 'Türkiye'}
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

  async sendAdminOrderNotification(order: any) {
    const adminEmail = 'blvzeunit@gmail.com';

    try {
      const fullName = order.shipping_address?.full_name || 'Bilinmiyor';
      const customerEmail = order.contact_info?.email || 'Bilinmiyor';
      const customerPhone = order.contact_info?.phone || 'Bilinmiyor';

      // Sipariş ürünlerini listele
      let itemsHtml = '';
      if (order.items && Array.isArray(order.items)) {
        itemsHtml = order.items.map((item: any) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name || 'Ürün'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price} TRY</td>
          </tr>
        `).join('');
      }

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <h1 style="background: #28a745; color: white; padding: 20px; margin: 0;">🎉 Yeni Sipariş Alındı!</h1>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Sipariş Detayları</h2>
            <p><strong>Sipariş No:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Tarih:</strong> ${new Date(order.created_at).toLocaleString('tr-TR')}</p>
            <p><strong>Toplam Tutar:</strong> ${order.total_amount} ${order.currency || 'TRY'}</p>
            <p><strong>Ödeme Durumu:</strong> ${order.payment_status === 'paid' ? '✅ Ödendi' : '⏳ Beklemede'}</p>
          </div>

          <div style="padding: 20px;">
            <h2>Müşteri Bilgileri</h2>
            <p><strong>Ad Soyad:</strong> ${fullName}</p>
            <p><strong>E-posta:</strong> ${customerEmail}</p>
            <p><strong>Telefon:</strong> ${customerPhone}</p>
          </div>

          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Teslimat Adresi</h2>
            <p>${order.shipping_address?.address || 'Adres bilgisi yok'}</p>
            <p>${order.shipping_address?.city || ''} / ${order.shipping_address?.country || 'Türkiye'}</p>
          </div>

          ${itemsHtml ? `
          <div style="padding: 20px;">
            <h2>Sipariş Ürünleri</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f4f4f4;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Ürün</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Beden</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Adet</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div style="padding: 20px; background: #e7f3ff; border-left: 4px solid #007bff; margin-top: 20px;">
            <p style="margin: 0;"><strong>💡 Hatırlatma:</strong> Admin panelden siparişi görüntüleyebilir ve kargo takip numarası ekleyebilirsiniz.</p>
          </div>
        </div>
      `;

      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to: adminEmail,
        subject: `🛒 Yeni Sipariş #${order.id.slice(0, 8)} - BLVZEUNIT`,
        html: htmlContent,
      });

      console.log('Admin order notification email sent:', data.data?.id);
      return data;
    } catch (error) {
      console.error('Failed to send admin order notification email:', error);
      // Hata fırlatmıyoruz ki sipariş akışı bozulmasın
      return null;
    }
  }
}
