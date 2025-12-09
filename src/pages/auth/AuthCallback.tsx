import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  // ❌ processedRef = useRef(false) KALDIRILDI

  useEffect(() => {
    console.log('🟢 AuthCallback mounted (Ref check removed)');

    // ❌ processedRef mantığı tamamen kaldırıldı.

    const processAuth = async () => {
      try {
        // 1. Önce mevcut session'ı kontrol et (Bu en önemli adım oldu)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        // Oturum ZATEN varsa (AuthContext tarafından ayarlanmış demektir), ana sayfaya yönlendir.
        if (currentSession) {
          console.log('✅ Session already exists, redirecting to /');
          navigate('/', { replace: true });
          return;
        }

        // 2. URL parametrelerini kontrol et
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const code = searchParams.get('code');
        const error = searchParams.get('error') || hashParams.get('error');
        const accessToken = hashParams.get('access_token');

        // 3. Hata durumu
        if (error) {
          console.error('❌ OAuth error:', error);
          navigate('/login?error=' + encodeURIComponent(error));
          return;
        }

        // 4. PKCE Flow (code exchange)
        if (code) {
          console.log('🔄 Processing PKCE flow');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) throw exchangeError;
          
          console.log('✅ PKCE successful, redirecting');
          navigate('/', { replace: true }); // Yönlendirmeyi yap
          return;
        }

        // 5. Hash/Implicit Flow
        if (accessToken) {
          console.log('🔄 Processing Hash flow');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (sessionError) throw sessionError;
          
          console.log('✅ Hash flow successful, redirecting');
          navigate('/', { replace: true }); // Yönlendirmeyi yap
          return;
        }

        // 6. Hiçbir parametre yoksa - Login'e yönlendir
        console.warn('⚠️ No auth parameters found, redirecting to login');
        navigate('/login');

      } catch (error: any) {
        console.error('🔥 AuthCallback error:', error);
        
        let errorMessage = 'auth_failed';
        if (error.message?.includes('invalid_grant')) errorMessage = 'invalid_grant';
        
        navigate(`/login?error=${errorMessage}`);
      }
    };

    // Hemen çalıştır
    processAuth();

    // Bu fallback artık yedek görevi görecektir.
    const fallbackTimeout = setTimeout(() => {
      console.log('⏰ Fallback timeout - forcing redirect to home');
      navigate('/', { replace: true });
    }, 5000);

    return () => clearTimeout(fallbackTimeout);

  }, [navigate]);

  // Sadece spinner göster
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ width: '50px', height: '50px', margin: '0 auto 20px' }}></div>
      <h3 style={{ marginBottom: '10px' }}>Google Hesabınız Doğrulanıyor</h3>
      <p style={{ color: '#666' }}>Lütfen bekleyin, yönlendiriliyorsunuz...</p>
    </div>
  );
}