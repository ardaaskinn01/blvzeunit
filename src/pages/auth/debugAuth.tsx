import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function DebugAuth() {
  useEffect(() => {
    const checkAuth = async () => {
      console.log('=== DEBUG AUTH ===');
      
      // 1. Session kontrolü
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      
      // 2. User kontrolü
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user);
      
      // 3. LocalStorage kontrolü
      console.log('LocalStorage supabase.auth.token:', localStorage.getItem('supabase.auth.token'));
      
      // 4. URL parametreleri
      console.log('URL Search:', window.location.search);
      console.log('URL Hash:', window.location.hash);
    };
    
    checkAuth();
    
    // Her 2 saniyede bir kontrol et
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h3>Auth Debug</h3>
      <button onClick={() => {
        supabase.auth.getSession().then(({ data }) => {
          console.log('Manual Session Check:', data.session);
          alert('Session: ' + (data.session ? 'EXISTS' : 'NULL'));
        });
      }}>
        Check Session Manually
      </button>
      
      <button onClick={() => {
        localStorage.removeItem('supabase.auth.token');
        alert('LocalStorage cleared');
      }}>
        Clear Auth Storage
      </button>
    </div>
  );
}