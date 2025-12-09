# Authentication Setup Guide

## Supabase Google OAuth Kurulumu

### 1. Google Cloud Console'da OAuth Credentials Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) açın
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. Sol menüden "APIs & Services" > "Credentials" seçin
4. "Create Credentials" > "OAuth 2.0 Client ID" seçin
5. Application type olarak "Web application" seçin
6. Authorized JavaScript origins'e ekleyin:
   - `http://localhost:5175` (development)
   - `http://localhost:5174` (development)
   - `https://your-domain.com` (production)

7. Authorized redirect URIs'e ekleyin:
   - `https://wsrtrnvfzuarpswkrlgz.supabase.co/auth/v1/callback` (Supabase)
   - `http://localhost:5175` (development - optional)

8. Client ID ve Client Secret'ı kopyalayın

### 2. Supabase'de Google OAuth Yapılandırması

1. [Supabase Dashboard](https://app.supabase.com/) açın
2. Your Project seçin
3. Sol menüden "Authentication" > "Providers" seçin
4. Google provider'ını bulun ve "Enable" e tıklayın
5. Client ID ve Client Secret'ı girin
6. Save butonu ile kaydedin

### 3. Localhost'ta Redirect URL Ayarları

Eğer localhost'ta test etmek istiyorsanız:

1. Supabase Dashboard > Authentication > URL Configuration
2. Site URL: `http://localhost:5175`
3. Redirect URLs: `http://localhost:5175`

## Ortam Değişkenleri (.env.local)

Aşağıdaki değişkenler `.env.local` dosyasında olmalıdır:

```env
VITE_SUPABASE_URL="https://wsrtrnvfzuarpswkrlgz.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_ZthOeM6-Z8AA3elL-XQbgw_Ger1UuBC"
VITE_RESEND_API_KEY="re_MqwGHnqA_MBMGY4vmFTroqi3wUahK8UAc"
VITE_CONTACT_EMAIL="ardaaskindm@gmail.com"
```

## Özellikler

- ✅ Email + Password ile kayıt ve giriş
- ✅ Google OAuth ile giriş/kayıt
- ✅ Otomatik session yönetimi (1 hafta expiry)
- ✅ Protected routes (korumalı sayfalar)
- ✅ Hesap sayfası (profile viewing)
- ✅ Otomatik logout button (Navbar'da giriş durumuna göre)

## Session Süresi

Supabase default olarak 1 hafta (7 gün) session expiry ile gelir. Bunu değiştirmek için:

1. Supabase Dashboard > Authentication > Providers
2. Auth > Email'in altında "Session duration" ayarlayabilirsiniz

## Testing

### Local Development
```bash
npm run dev
```

Test URL: `http://localhost:5175`

### Test Akışı
1. `/login` sayfasına gidin
2. Email/password ile giriş yapın veya Google ile giriş yapın
3. Başarılı giriş sonrası anasayfaya yönlendirileceksiniz
4. Navbar'da "Hesabım" butonu görünecek
5. Hesabım sayfasında profil bilgileri ve oturum süresi gösterilecek
6. "Çıkış Yap" butonu ile logout yapabilirsiniz

## Troubleshooting

### "Google ile giriş" butonu çalışmıyorsa
- Google Cloud Console'da OAuth credentials kontrol edin
- Supabase'de Google provider'ın enabled olduğunu kontrol edin
- Redirect URLs doğru olduğunu kontrol edin

### Session expire sorunu
- Browser cookies'yi temizleyin
- Application > Cookies seçin ve Supabase cookies'lerini silin
- Sayfayı yeniden yükleyin

### Login sonrası anasayfaya gitmiyorsa
- Browser console'da hata var mı kontrol edin (F12)
- Network tab'de request'leri kontrol edin
