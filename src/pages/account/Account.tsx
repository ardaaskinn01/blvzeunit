import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

export default function AccountPage() {
  const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sadece auth loading kontrolü
  if (authLoading) {
    return (
      <div className="account-page">
        <div className="account-container" style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner"></div>
          <p>Hesap yükleniyor...</p>
        </div>
      </div>
    );
  }

  // User kontrolü - auth loading bittiyse ama user yoksa
  if (!user) {
    return (
      <div className="account-page">
        <div className="account-container" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Giriş Yapmanız Gerekiyor</h2>
          <button
            onClick={() => navigate('/login')}
            className="logout-btn"
            style={{ marginTop: '20px' }}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    console.log('🔴 Logout button clicked');

    // İşlem başladığını göster
    setIsLoggingOut(true);

    try {
      // 1. Önce state'leri temizle (UI'da hemen göster)
      console.log('🧹 Clearing local state...');

      // 2. Çıkış işlemini başlat
      await signOut();

      console.log('✅ Logout successful, redirecting...');

      // 3. Login sayfasına yönlendir
      // React Router ve AuthContext zaten state'leri temizliyor, reload gereksiz
      navigate('/login', { replace: true });

    } catch (error: any) {
      console.error('❌ Logout failed:', error);

      // Hata olsa bile login sayfasına git
      console.log('⚠️ Force redirecting to login despite error');

      // State'leri temizle
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-wsrtrnvfzuarpswkrlgz-auth-token');

      // Login sayfasına yönlendir
      window.location.href = '/login';
    }
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <h1>HESABIM</h1>

        {isAdmin && (
          <div className="admin-badge">
            <span>ADMİN</span>
            <button
              onClick={() => navigate('/admin')}
              className="admin-link"
            >
              PANEL
            </button>
          </div>
        )}

        <div className="account-info">
          <div className="info-section">
            <h2>PROFİL BİLGİLERİ</h2>

            <div className="info-item">
              <label>E-POSTA:</label>
              <p>{user.email}</p>
            </div>

            <div className="info-item">
              <label>AD SOYAD:</label>
              <p>
                {profile?.full_name ||
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  'İsimsiz'}
              </p>
            </div>
          </div>

          <div className="account-actions">
            <button
              onClick={() => navigate('/')}
              className="secondary-btn"
            >
              Ana Sayfa
            </button>

            <button
              onClick={handleLogout}
              className="logout-btn"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '...' : 'Çıkış'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}