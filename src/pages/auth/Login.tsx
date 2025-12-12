import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabase'; // Doğrudan import
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Başarılı giriş
      navigate('/', { replace: true });

    } catch (err: any) {
      let msg = 'Giriş başarısız.';
      if (err.message.includes('Invalid login')) msg = 'E-posta veya şifre hatalı.';
      if (err.message.includes('Email not confirmed')) msg = 'E-posta adresinizi doğrulamanız gerekiyor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Hata ayıklama için URL'yi loglayın
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account', // Kullanıcının hesap seçmesini zorla
          },
        },
      });

      if (error) {
        console.error('Google OAuth Error:', error);
        throw error;
      }

      // Başarılı yönlendirme olacak, loading'i kapatmaya gerek yok
    } catch (err: any) {
      console.error('Google Auth Catch Error:', err);
      setError(err.message || 'Google ile giriş yapılamadı');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>GİRİŞ YAP</h2>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span>
            <p>
              {(() => {
                const params = new URLSearchParams(window.location.search);
                const errorType = params.get('error');

                switch (errorType) {
                  case 'profile_creation_failed':
                    return 'Profil oluşturulamadı. Lütfen tekrar deneyin veya yönetici ile iletişime geçin.';
                  case 'oauth_invalid_grant':
                    return 'Oturum süresi doldu. Lütfen tekrar deneyin.';
                  case 'oauth_failed':
                    return 'Google ile giriş başarısız. Lütfen tekrar deneyin.';
                  default:
                    return error;
                }
              })()}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={loading} required className="form-input" />
          </div>

          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label">Şİfre</label>
            </div>
            <input type="password" name="password" value={formData.password} onChange={handleChange} disabled={loading} required className="form-input" />
          </div>

          {/* YENİ LİNK STİLİ */}
          <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.9rem', textAlign: 'right', display: 'block' }}>
            Şifremi Unuttum?
          </Link>
          <button type="submit" className="submit-btn primary" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Gİrİş Yap'}
          </button>
        </form>
        <div className="social-login">
          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="social-btn google">
            Google ile Devam Et
          </button>
        </div>

        <div className="auth-footer">
          <p>Hesabınız yok mu? <Link to="/signup" className="auth-link">Kayıt Olun</Link></p>
        </div>
      </div>
    </div>
  );
}