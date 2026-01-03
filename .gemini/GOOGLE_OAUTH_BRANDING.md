# Google OAuth Branding Ayarları

Google girişinde "BLVZEUNIT" görünmesi için aşağıdaki adımları takip edin:

## 1. Google Cloud Console Ayarları

### OAuth Consent Screen
1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **OAuth consent screen**
2. **App name** kısmını `BLVZEUNIT` olarak değiştirin
3. **User support email** ve **Developer contact email** kısımlarını `blvzeunit@gmail.com` olarak ayarlayın
4. **Application home page** kısmına `https://blvzeunit.com` yazın
5. **Application privacy policy link** kısmına `https://blvzeunit.com/privacy-policy` yazın
6. **Application terms of service link** kısmına `https://blvzeunit.com/terms-of-service` yazın
7. **Authorized domains** kısmına şunları ekleyin:
   - `blvzeunit.com`
   - `supabase.co` (Supabase redirect için gerekli)
8. **Save and Continue** butonuna tıklayın

### OAuth Client ID Ayarları
1. **APIs & Services** → **Credentials** → OAuth 2.0 Client ID'nizi seçin
2. **Authorized JavaScript origins** kısmına:
   - `https://blvzeunit.com`
   - `http://localhost:5173` (development için)
3. **Authorized redirect URIs** kısmına:
   - `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
   - `http://localhost:5173` (development için)
4. **Save** butonuna tıklayın

## 2. Supabase Dashboard Ayarları

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projeniz → **Authentication** → **URL Configuration**
2. **Site URL**: `https://blvzeunit.com`
3. **Redirect URLs** (her satıra bir tane):
   ```
   https://blvzeunit.com/**
   http://localhost:5173/**
   ```
4. **Save** butonuna tıklayın

## 4. (Çok Önemli) Domain Doğrulama

Google'ın uygulamanızı tanıması ve URL yerine isminizi göstermesi için domain sahipliğini doğrulamanız gerekir:

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Domain verification**
2. **Add Domain** butonuna tıklayın
3. `blvzeunit.com` adresini girin
4. Sizi **Google Search Console**'a yönlendirebilir. Oradaki adımları takip ederek domain sahibi olduğunuzu doğrulayın (DNS TXT kaydı ekleyerek).
5. Doğrulama bittikten sonra Google Cloud Console'a geri dönün ve domainin listede "Verified" olarak göründüğünden emin olun.

## 5. Logo Yükleme

Uygulamanızın logosunu yüklemek, Google'ın güven skorunu artırır ve marka isminin görünmesine yardımcı olur.
1. **OAuth consent screen** ayarlarında uygulamanızın logosunu yükleyin (120x120px kare formatında).

## ⚠️ Neden Hala Supabase URL'i Görünüyor?

Eğer yukarıdaki her şeyi yaptıysanız ve hala `project-id.supabase.co` adresi görünüyorsa, bunun sebebi **Supabase Free Tier** (Ücretsiz Plan) kullanmanızdır.

- Google, güvenlik gereği, giriş işleminden sonra kullanıcının yönlendirileceği **gerçek adresi** (Redirect URI) kullanıcıya gösterir.
- Supabase Ücretsiz planda, bu adres zorunlu olarak `https://[project-id].supabase.co/auth/v1/callback` şeklindedir.
- Google bu yüzden "Sizi supabase.co adresine yönlendireceğiz" der.

### Kesin Çözüm: Supabase Custom Domain ($10/ay)

Bu yazıyı tamamen kaldırıp sadece `blvzeunit.com` göstermenin **tek kesin yolu** Supabase'de Custom Domain özelliğini kullanmaktır.

1. Supabase projenizde **Settings** → **Add-ons** → **Custom Domain**'i etkinleştirin ($10/ay).
2. `auth.blvzeunit.com` gibi bir alt alan adı belirleyin.
3. DNS ayarlarını yapın.
4. Google Cloud Console'da Redirect URI kısmını `https://auth.blvzeunit.com/auth/v1/callback` olarak güncelleyin.
5. Bu işlemden sonra Google artık Supabase URL'ini değil, sizin domaininizi görecektir.

## Test

Değişiklikleri yaptıktan sonra:
1. Tarayıcınızın cache'ini temizleyin
2. Uygulamanızdan çıkış yapın
3. Google ile tekrar giriş yapmayı deneyin
4. Artık "BLVZEUNIT uygulamasına giriş yapın" şeklinde görünmeli

## Notlar

- Google OAuth consent screen değişikliklerinin yayılması birkaç dakika sürebilir
- Eğer uygulamanız "Testing" modundaysa, sadece test kullanıcıları giriş yapabilir
- Production'a geçmek için Google'ın onay sürecinden geçmeniz gerekebilir
