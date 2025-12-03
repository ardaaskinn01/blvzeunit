import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
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

    // E-posta gönder
    const response = await resend.emails.send({
      from: 'noreply@myshop.com', // Resend'de doğrulanmış domain kullan
      to: process.env.CONTACT_EMAIL || 'admin@myshop.com',
      reply_to: email,
      subject: `Yeni İletişim: ${subject}`,
      html: `
        <h2>Yeni İletişim Mesajı</h2>
        <p><strong>İsim:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
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
