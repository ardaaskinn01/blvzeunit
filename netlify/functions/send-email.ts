import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// XSS koruması için HTML escape fonksiyonu
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

const handler: Handler = async (event) => {
  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Form verilerini parse et
    const body: ContactFormData = JSON.parse(event.body || '{}');

    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Tüm alanları doldurunuz' }),
      };
    }

    // Kullanıcı girdilerini sanitize et (XSS koruması)
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    // E-posta gönder
    const response = await resend.emails.send({
      from: 'info@blvzeunit.com', // Resend'de doğrulanmış domain kullan
      to: process.env.VITE_CONTACT_EMAIL || 'admin@myshop.com',
      reply_to: email,
      subject: `Yeni İletişim: ${safeSubject}`,
      html: `
        <h2>Yeni İletişim Mesajı</h2>
        <p><strong>İsim:</strong> ${safeName}</p>
        <p><strong>E-posta:</strong> ${safeEmail}</p>
        <p><strong>Konu:</strong> ${safeSubject}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'E-posta başarıyla gönderildi',
        id: response.data?.id,
      }),
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'E-posta gönderilirken hata oluştu',
      }),
    };
  }
};

export { handler };
