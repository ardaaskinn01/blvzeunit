import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Debug için console.log ekleyelim
console.log('🔄 Supabase başlatılıyor...');
console.log('📡 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔑 VITE_SUPABASE_ANON_KEY var mı?', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// URL ve anahtarın doğru olduğundan emin olun
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase URL veya anahtar tanımlı değil!');
  console.error('❌ VITE_SUPABASE_URL:', supabaseUrl);
  console.error('❌ VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Tanımlı' : 'Tanımsız');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ✅ KRİTİK: Oturumun LocalStorage'da kalıcı olmasını sağlar (Önceki hali: false)
    persistSession: true,

    // ✅ KRİTİK: Süresi dolan jetonları otomatik yeniler
    // AuthContext'teki fix sayesinde bu artık gereksiz re-render yapmaz
    autoRefreshToken: true,

    // Tarayıcı depolama türünü belirtin
    storage: window.localStorage,

    // AuthCallback URL'sinde oturum algılamasına izin ver (Önceki hali: false)
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Bağlantı testi fonksiyonu
export const testConnection = async () => {
  console.log('🧪 Supabase bağlantı testi başlıyor...');

  try {
    // Daha basit bir test
    const { data, error, status } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    console.log('📊 Test sonucu:', {
      status,
      error,
      dataLength: data?.length,
      data
    });

    if (error) {
      console.error('❌ Bağlantı hatası:', error);
      console.error('❌ Error details:', error.message, error.details, error.hint);
      return false;
    }

    console.log('✅ Bağlantı başarılı!');
    return true;
  } catch (err) {
    console.error('❌ Test sırasında beklenmeyen hata:', err);
    return false;
  }
};