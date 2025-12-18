import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Şifre güçlülük kontrolü
  const validatePassword = (password: string): string => {
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

  const validateForm = () => {
    if (!formData.name.trim()) return 'Lütfen adınızı girin';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Geçerli bir e-posta adresi girin';

    // Şifre validasyonu
    const passwordError = validatePassword(formData.password);
    if (passwordError) return passwordError;

    if (formData.password !== formData.confirmPassword) return 'Şifreler eşleşmiyor';
    if (!termsAccepted) return 'Kullanım koşullarını kabul etmelisiniz';
    return '';
  };

  // Şifre gereksinimlerini kontrol et
  const getPasswordRequirements = () => {
    const { password } = formData;
    return {
      length: password.length >= 6,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'customer'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user && !data.session) {
        setSuccessMessage(`Kayıt başarılı! Lütfen ${formData.email} adresine gönderilen onay linkine tıklayın.`);
      } else {
        setSuccessMessage('Kayıt başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => navigate('/'), 2000);
      }

      setFormData({ name: '', email: '', password: '', confirmPassword: '' });

    } catch (err: any) {
      setError(err.message || 'Kayıt başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('Google OAuth Error:', error);
        throw error;
      }

    } catch (err: any) {
      console.error('Google Auth Catch Error:', err);
      setError(err.message || 'Google ile giriş yapılamadı');
      setLoading(false);
    }
  };

  const passwordRequirements = getPasswordRequirements();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>HESAP OLUŞTUR</h2>
        </div>

        {error && <div className="auth-error"><span>⚠️</span><p>{error}</p></div>}

        {successMessage && (
          <div className="auth-success">
            <span>✅</span>
            <p>{successMessage}</p> <br />
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Ad Soyad</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız ve soyadınız"
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                required
                className="form-input"
              />

              {/* Şifre gereksinimleri gösterimi */}
              {formData.password && (
                <div className="password-requirements">
                  <p className="form-hint">Şifreniz şunları içermelidir:</p>
                  <ul className="requirements-list">
                    <li className={passwordRequirements.length ? 'valid' : ''}>
                      {passwordRequirements.length ? '✓ ' : '✗ '}En az 6 karakter
                    </li>
                    <li className={passwordRequirements.lowercase ? 'valid' : ''}>
                      {passwordRequirements.lowercase ? '✓ ' : '✗ '}En az bir küçük harf
                    </li>
                    <li className={passwordRequirements.uppercase ? 'valid' : ''}>
                      {passwordRequirements.uppercase ? '✓ ' : '✗ '}En az bir büyük harf
                    </li>
                    <li className={passwordRequirements.number ? 'valid' : ''}>
                      {passwordRequirements.number ? '✓ ' : '✗ '}En az bir rakam
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Şifre Tekrar</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                required
                className="form-input"
              />
              {formData.confirmPassword && (
                <p className={`form-hint ${formData.password === formData.confirmPassword ? 'valid' : 'invalid'}`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ Şifreler eşleşiyor'
                    : '✗ Şifreler eşleşmiyor'}
                </p>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={loading}
                  required
                />
                <span>
                  <Link to="/terms" className="terms-link">Kullanım Koşulları</Link>'nı kabul ediyorum
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="submit-btn primary"
              disabled={loading || !formData.name || !formData.email || !formData.password || !formData.confirmPassword || !termsAccepted}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  İşleniyor...
                </>
              ) : 'Kayıt Ol'}
            </button>
          </form>
        )}

        <div className="auth-divider"><span>veya</span></div>
        <div className="social-login">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="social-btn google"
          >
            Google ile Kayıt Ol
          </button>
        </div>
        <div className="auth-footer">
          <p>Zaten hesabınız var mı? <Link to="/login" className="auth-link">Giriş Yapın</Link></p>
        </div>
      </div>
    </div>
  );
}