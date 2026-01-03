# 🌐 Domain Sahipliği Doğrulama Rehberi (Google Fix)

Aldığınız "The website of your home page URL is not registered to you" hatasını çözmek için aşağıdaki adımları sırasıyla uygulayın.

## 1. Google Search Console'dan Kod Alma

1. [Google Search Console](https://search.google.com/search-console)'a gidin.
2. Sol üst köşedeki menüden **Mülk ekle (Add property)** seçeneğine tıklayın.
3. Açılan pencerede **Alan Adı (Domain)** seçeneğini seçin (Sol taraftaki kutu).
4. `blvzeunit.com` yazın ve **Devam** butonuna basın.
5. Karşınıza bir doğrulama ekranı çıkacak ve size `google-site-verification=...` ile başlayan bir kod verecek.
6. Bu kodu **Kopyala** butonu ile kopyalayın.

## 2. DNS Kaydını Ekleme

Bu adımı alan adınızın DNS ayarlarını yönettiğiniz yerde yapmalısınız. Eğer siteniz Netlify üzerindeyse ve Netlify DNS kullanıyorsanız:

### Netlify Kullanıyorsanız:
1. [Netlify Dashboard](https://app.netlify.com/)'a gidin.
2. **Domains** sekmesine tıklayın.
3. `blvzeunit.com` domainine tıklayın.
4. **DNS settings** paneline girin.
5. **Add new record** butonuna tıklayın.
   - **Record type:** `TXT`
   - **Name:** `@` (veya boş bırakın)
   - **Value:** Google'dan kopyaladığınız kodu buraya yapıştırın.
   - **TTL:** `3600` (varsayılan kalabilir)
6. **Save** butonuna basarak kaydedin.

### Başka Bir Firma (GoDaddy, İsimtescil vb.) Kullanıyorsanız:
1. Alan adı sağlayıcınızın paneline girin.
2. `blvzeunit.com` için **DNS Yönetimi** veya **Gelişmiş DNS Ayarları** sayfasına gidin.
3. **Yeni Kayıt Ekle** (Add Record) deyin.
   - **Tip (Type):** `TXT`
   - **Host/Ad:** `@` (bazı firmalar boş bırakmanızı ister)
   - **Değer (Value/Content):** Google'dan kopyaladığınız kod.
4. Kaydedin.

## 3. Doğrulamayı Tamamlama

1. DNS kaydını ekledikten sonra yaklaşık 1-5 dakika bekleyin (DNS yayılması için).
2. **Google Search Console** ekranına geri dönün.
3. **Doğrula (Verify)** butonuna basın.
4. Eğer "Sahiplik doğrulandı" (Ownership verified) mesajını görürseniz işlem tamamdır! ✅
   * *Hata alırsanız 5-10 dakika daha bekleyip tekrar deneyin.*

## 4. Google Cloud Console'a Dönüş

1. Hatayı aldığınız **Google Cloud Console** ekranına ("Branding verification issues" penceresi) geri dönün.
2. **"I have fixed the issues"** seçeneğini işaretleyin.
3. **Request re-verification** veya **Proceed** butonuna tıklayın.

Artık Google domainin size ait olduğunu bildiği için uygulama isminizi ve logonuzu onaylayacaktır.
