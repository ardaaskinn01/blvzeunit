import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // URL'den token kontrolü
  useEffect(() => {
    const checkSessionAndToken = async () => {
      try {
        // URL'de hash kısmını kontrol et (Supabase OAuth için)
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
          // Recovery token varsa, Supabase bunu otomatik işleyecek
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Session error:', error);
            setError('Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.');
            setIsValidSession(false);
          } else if (data.session) {
            console.log('Valid recovery session found');
            setIsValidSession(true);
          } else {
            setError('Lütfen şifre sıfırlama bağlantısını tekrar isteyin.');
            setIsValidSession(false);
          }
        } else {
          // Kullanıcı zaten giriş yapmış olabilir
          if (user) {
            setIsValidSession(true);
          } else {
            setError('Şifre sıfırlama işlemi için giriş yapmalısınız.');
            setIsValidSession(false);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('Şifre sıfırlama bağlantısı geçersiz.');
        setIsValidSession(false);
      } finally {
        setSessionChecked(true);
      }
    };

    checkSessionAndToken();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Şifre en az 6 karakter olmalıdır';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Şifre en az bir küçük harf içermelidir';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Şifre en az bir büyük harf içermelidir';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Şifre en az bir rakam içermelidir';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validasyon
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      // Mevcut session'ı al
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar deneyin.');
      }

      // Şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) {
        throw updateError;
      }

      // Başarı mesajı göster
      setSuccess('Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...');

      // Formu temizle
      setFormData({
        password: '',
        confirmPassword: '',
      });

      // Profili yenile (eğer context'te varsa)
      if (window.location.hash.includes('type=recovery')) {
        // Recovery modundaysa, kullanıcıyı çıkış yaptır ve login'e yönlendir
        setTimeout(async () => {
          await signOut();
          navigate('/login?reset=success', { replace: true });
        }, 3000);
      } else {
        // Normal şifre değişikliği ise, hesap sayfasına yönlendir
        setTimeout(() => {
          navigate('/account?password=changed', { replace: true });
        }, 3000);
      }

    } catch (err: any) {
      console.error('Password reset error:', err);

      let errorMessage = 'Şifre güncellenemedi. Lütfen tekrar deneyin.';

      if (err.message.includes('Password should be at least')) {
        errorMessage = 'Şifre en az 6 karakter olmalıdır';
      } else if (err.message.includes('Auth session missing')) {
        errorMessage = 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.';
      } else if (err.message.includes('Invalid refresh token')) {
        errorMessage = 'Bağlantının süresi dolmuş. Lütfen yeni bir şifre sıfırlama bağlantısı isteyin.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (window.location.hash.includes('type=recovery')) {
      // Recovery modundaysa login'e git
      navigate('/login');
    } else {
      // Normal moddaysa hesap sayfasına git
      navigate('/account');
    }
  };

  if (!sessionChecked) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Yükleniyor...</h1>
            <p className="auth-subtitle">Lütfen bekleyin</p>
          </div>
          <div className="text-center">
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Geçersiz Bağlantı</h1>
            <p className="auth-subtitle">Şifre sıfırlama bağlantınız geçersiz veya süresi dolmuş</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="password-instructions">
            <p>Yeni bir şifre sıfırlama bağlantısı almak için:</p>
            <ol>
              <li><Link to="/forgot-password">Şifremi Unuttum</Link> sayfasına gidin</li>
              <li>E-posta adresinizi girin</li>
              <li>Gelen e-postadaki bağlantıyı kullanın</li>
            </ol>
          </div>

          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <button
              onClick={() => navigate('/forgot-password')}
              className="submit-btn primary"
              style={{ marginBottom: '16px' }}
            >
              Yeni Şifre Sıfırlama Bağlantısı İste
            </button>
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Yeni Şifre Belirle</h1>
          <p className="auth-subtitle">Hesabınız için yeni bir şifre oluşturun</p>
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
            <label htmlFor="password" className="form-label">
              Yeni Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              required
              className="form-input"
              autoComplete="new-password"
            />
            <div className="password-requirements">
              <p className="form-hint">Şifreniz şunları içermelidir:</p>
              <ul className="requirements-list">
                <li className={formData.password.length >= 6 ? 'valid' : ''}>
                  En az 6 karakter
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'valid' : ''}>
                  En az bir küçük harf
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : ''}>
                  En az bir büyük harf
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'valid' : ''}>
                  En az bir rakam
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Şifreyi Onayla
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              required
              className="form-input"
              autoComplete="new-password"
            />
            {formData.confirmPassword && (
              <p className={`form-hint ${formData.password === formData.confirmPassword ? 'valid' : 'invalid'}`}>
                {formData.password === formData.confirmPassword
                  ? '✓ Şifreler eşleşiyor'
                  : '✗ Şifreler eşleşmiyor'}
              </p>
            )}
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={handleGoBack}
              className="submit-btn secondary"
              disabled={loading}
            >
              Geri Dön
            </button>
            <button
              type="submit"
              className="submit-btn primary"
              disabled={loading || !formData.password || !formData.confirmPassword}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Güncelleniyor...
                </>
              ) : (
                'Şifreyi Güncelle'
              )}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Sorun yaşıyorsanız{' '}
            <Link to="/contact" className="auth-link">
              destek ekibimizle iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}