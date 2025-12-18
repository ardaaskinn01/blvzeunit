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
      <div className="contact-wrapper">
        <div className="about-section">
          <h2>İLETİŞİM</h2>
          <div className="contact-info-item">
            <h3>E-POSTA</h3>
            <p>blvzeunit@gmail.com</p>
          </div>
          <div className="contact-info-item">
            <h3>ADRES</h3>
            <p>4562 Sokak No:31 Kat:2 Daire:2<br />Sevgi Mahallesi<br />Karabağlar/İzmir</p>
          </div>
        </div>

        <div className="contact-container">
          <h2>BİZE ULAŞIN</h2>
          <p>Sorularınız için aşağıdaki formu doldurabilirsiniz.</p>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">İSİM</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-POSTA</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ornek@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">KONU</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Mesajınızın konusu"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">MESAJ</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="İletmek istediğiniz mesaj..."
              ></textarea>
            </div>

            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
            </button>
          </form>

          {responseMessage && (
            <div className={`response-message ${isError ? 'error' : 'success'}`}>
              {responseMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
