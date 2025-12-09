import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function EmailConfirmationPage() {
  const [loading, setLoading] = useState(false); // false yap test için
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // TEST: Hemen confirmed göster
  useEffect(() => {
    console.log('🔍 EmailConfirmationPage mounted');
    console.log('🔍 User:', user);
    console.log('🔍 Search params:', Object.fromEntries([...searchParams]));

    // Test için hemen başarılı göster
    if (user) {
      console.log('✅ Test: Showing confirmed for user:', user.email);
      setConfirmed(true);
      setSuccess('TEST MODE: Email confirmed automatically');
      setLoading(false);
      return;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        // URL'de confirmation token varsa
        if (token_hash && type === 'signup') {
          const { error: confirmError } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup',
          });

          if (confirmError) {
            console.error('Email confirmation error:', confirmError);

            if (confirmError.message.includes('already confirmed')) {
              setSuccess('Email adresiniz zaten onaylanmış.');
              setConfirmed(true);
            } else if (confirmError.message.includes('expired')) {
              setError('Onay bağlantısının süresi dolmuş. Lütfen yeni bir onay maili isteyin.');
            } else {
              setError('Geçersiz onay bağlantısı.');
            }
          } else {
            setSuccess('Email adresiniz başarıyla onaylandı! Yönlendiriliyorsunuz...');
            setConfirmed(true);

            // 3 saniye sonra ana sayfaya yönlendir
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 3000);
          }
        } else {
          // Kullanıcı zaten giriş yapmış ve onay durumunu kontrol et
          if (user) {
            // Check if email is confirmed via user metadata
            const isEmailConfirmed = user.email_confirmed_at !== null;
            if (isEmailConfirmed) {
              setConfirmed(true);
              setSuccess('Email adresiniz zaten onaylanmış.');
            } else {
              setError('Email adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.');
            }
          }
        }
      } catch (err: any) {
        console.error('Email confirmation error:', err);
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, user]);

  const handleResendConfirmation = async () => {
    setResending(true);
    setError('');

    try {
      if (!user?.email) {
        throw new Error('Kullanıcı email adresi bulunamadı');
      }

      // Resend confirmation email using Supabase
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (resendError) {
        throw new Error(resendError.message || 'Onay maili gönderilemedi');
      }

      setSuccess('Yeni onay maili gönderildi! Lütfen e-postanızı kontrol edin.');
    } catch (err: any) {
      setError(err.message || 'Onay maili gönderilemedi.');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Onaylanıyor...</h1>
            <p className="auth-subtitle">Lütfen bekleyin</p>
          </div>
          <div className="text-center">
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Email Onayı</h1>
          <p className="auth-subtitle">
            {confirmed ? 'Hesabınız aktif!' : 'Hesabınızı aktifleştirin'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span>
            <div>
              <p>{error}</p>
              {!confirmed && user && (
                <button
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="resend-btn"
                  style={{
                    marginTop: '10px',
                    background: 'transparent',
                    border: '1px solid #667eea',
                    color: '#667eea',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {resending ? 'Gönderiliyor...' : 'Yeni Onay Maili Gönder'}
                </button>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <span>✅</span>
            <p>{success}</p>
          </div>
        )}

        {!user && !confirmed && (
          <div className="email-confirmation-info">
            <h3>Giriş Yapın</h3>
            <p>Email onay durumunuzu kontrol etmek için lütfen giriş yapın.</p>
            <Link to="/login" className="submit-btn primary" style={{ display: 'block', textAlign: 'center' }}>
              Giriş Yap
            </Link>
          </div>
        )}

        {user && !confirmed && (
          <div className="email-confirmation-instructions">
            <h3>Ne Yapmalıyım?</h3>
            <ol>
              <li>E-posta adresinizi kontrol edin ({user.email})</li>
              <li>"Hesabınızı Aktifleştirin" başlıklı maili bulun</li>
              <li>Maildeki "Hesabı Onayla" butonuna tıklayın</li>
              <li>E-postayı görmediyseniz spam klasörünüze bakın</li>
            </ol>

            <div className="confirmation-actions">
              <button
                onClick={handleResendConfirmation}
                disabled={resending}
                className="submit-btn primary"
              >
                {resending ? (
                  <>
                    <span className="spinner"></span>
                    Gönderiliyor...
                  </>
                ) : (
                  'Yeni Onay Maili Gönder'
                )}
              </button>

              <button
                onClick={() => navigate('/account')}
                className="submit-btn secondary"
              >
                Hesabıma Git
              </button>
            </div>
          </div>
        )}

        {confirmed && (
          <div className="email-confirmation-success">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Hesabınız Aktif!</h3>
            <p>Artık tüm özelliklerimizden faydalanabilirsiniz.</p>

            <div className="success-actions">
              <Link to="/" className="submit-btn primary">
                Ana Sayfaya Git
              </Link>
              <Link to="/account" className="submit-btn secondary">
                Hesabım
              </Link>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Sorularınız mı var?{' '}
            <Link to="/contact" className="auth-link">
              Bize ulaşın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}