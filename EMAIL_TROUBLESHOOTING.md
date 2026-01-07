# E-POSTA SORUN GİDERME KILAVUZU

## Sorun: Sipariş sonrası admin'e (blvzeunit@gmail.com) e-posta gelmiyor

### ✅ Kod Kontrolü
Kod tamamen doğru:
- `netlify/functions/services/email.ts` satır 115-200: `sendAdminOrderNotification` fonksiyonu var
- `netlify/functions/process-order-complete.ts` satır 99-100: Admin e-postası gönderiliyor
- Hedef adres: `blvzeunit@gmail.com` (satır 116)

### 🔍 Kontrol Edilmesi Gerekenler

#### 1. Netlify Environment Variables
Netlify Dashboard > Site Settings > Environment Variables:
- ✅ `RESEND_API_KEY` tanımlı mı?
- ✅ Değeri doğru mu? (Resend Dashboard'dan kontrol edin)

#### 2. Resend Domain Doğrulaması
Resend Dashboard (resend.com):
- ✅ `blvzeunit.com` domain'i eklenmiş mi?
- ✅ DNS kayıtları doğru mu? (SPF, DKIM, DMARC)
- ✅ Domain durumu "Verified" mı?

#### 3. Gmail Spam Klasörü
- ✅ `blvzeunit@gmail.com` hesabında Spam klasörünü kontrol edin
- ✅ "Sosyal" veya "Promosyonlar" sekmelerini kontrol edin

#### 4. Netlify Functions Logları
Netlify Dashboard > Functions > process-order-complete:
- ✅ Fonksiyon çalışıyor mu?
- ✅ Hata var mı?
- ✅ "Admin order notification email sent" logu görünüyor mu?

#### 5. Resend Dashboard Logları
Resend Dashboard > Logs:
- ✅ E-posta gönderim denemesi var mı?
- ✅ Durum nedir? (Sent, Failed, Bounced)
- ✅ Hata mesajı var mı?

### 🛠️ Test Adımları

#### Test 1: Manuel E-posta Gönderimi
Netlify Functions'ı test edin:
\`\`\`bash
# Netlify CLI ile test
netlify functions:invoke process-order-complete --payload '{"orderId":"test-id","paymentToken":"test"}'
\`\`\`

#### Test 2: Resend API Test
Resend Dashboard'da "Send Test Email" ile `blvzeunit@gmail.com`'a test maili gönderin.

#### Test 3: Gerçek Sipariş
Canlı sitede bir test siparişi verin ve logları izleyin.

### 📝 Olası Çözümler

#### Çözüm 1: RESEND_API_KEY Eksik
Netlify Dashboard > Environment Variables > Add:
- Key: `RESEND_API_KEY`
- Value: `re_xxxxxxxxxxxxx` (Resend'den alın)
- Scope: All (Production, Deploy Previews, Branch Deploys)

Sonra siteyi yeniden deploy edin.

#### Çözüm 2: Domain Doğrulanmamış
Resend Dashboard > Domains > Add Domain:
1. `blvzeunit.com` ekleyin
2. DNS kayıtlarını domain sağlayıcınıza ekleyin
3. "Verify" butonuna tıklayın

#### Çözüm 3: Gmail Engelleme
Gmail Settings > Filters and Blocked Addresses:
- `info@blvzeunit.com` adresini "Never send to Spam" olarak işaretleyin

#### Çözüm 4: Kod Güncellemesi (Gerekirse)
Eğer yukarıdakiler çalışmazsa, e-posta servisini güncelleyebiliriz:
- Farklı bir e-posta sağlayıcısı (SendGrid, Mailgun)
- Doğrudan Gmail SMTP
- Supabase Edge Functions ile alternatif yöntem

### 🔗 Faydalı Linkler
- Resend Dashboard: https://resend.com/emails
- Netlify Functions Logs: https://app.netlify.com/sites/[site-name]/functions
- DNS Kontrol: https://mxtoolbox.com/

### 📞 Sonraki Adım
Lütfen yukarıdaki kontrolleri yapın ve hangi adımda sorun olduğunu bildirin.
