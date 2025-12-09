import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: resetError, success: resetSuccess } = await resetPassword(email);

      // HATA durumunda bile güvenlik için "başarılı" mesajı göster
      if (!resetSuccess || resetError) {
        // Güvenlik nedeniyle: Email bulunamasa bile "gönderildi" mesajı ver
        if (resetError?.includes('not found') || resetError?.includes('user')) {
          setSuccess('Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Spam klasörünüzü kontrol etmeyi unutmayın.');
        } else {
          setError(resetError || 'Şifre sıfırlama başarısız');
        }
        return;
      }


    } catch (err: any) {
      console.error('Unexpected error:', err);
      // Beklenmeyen hata durumunda da güvenlik için
      setSuccess('Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Şifremi Unuttum</h1>
          <p className="auth-subtitle">Şifrenizi sıfırlamak için e-posta adresinizi girin</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <span>✅</span>
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              E-posta Adresi
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              disabled={loading}
              required
              className="form-input"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="submit-btn primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Gönderiliyor...
              </>
            ) : (
              'Şifre Sıfırlama Bağlantısı Gönder'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link">
              Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}