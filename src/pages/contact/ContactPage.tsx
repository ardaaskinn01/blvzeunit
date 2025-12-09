import { useState, type FormEvent } from 'react';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResponseMessage('');
    setIsError(false);

    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage('✅ E-posta başarıyla gönderildi!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        setIsError(true);
        setResponseMessage(data.error || 'E-posta gönderilemedi');
      }
    } catch (error) {
      setIsError(true);
      setResponseMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>İletişim</h1>
        <p>Bize yazın, en kısa sürede cevap vereceğiz.</p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">İsim *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Adınız"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="E-posta adresiniz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Konu *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Mesaj konusu"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Mesaj *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Mesajınız"
            ></textarea>
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </form>

        {responseMessage && (
          <div className={`response-message ${isError ? 'error' : 'success'}`}>
            {responseMessage}
          </div>
        )}
      </div>
    </div>
  );
}
