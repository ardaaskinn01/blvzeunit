# iyzico Payment Integration

Bu proje, iyzico ödeme altyapısı ile entegre edilmiştir.

## 🔐 SSL Sertifikası

✅ **SSL sertifikası hazır!** Netlify otomatik olarak tüm sitelere ücretsiz SSL sertifikası sağlar. Alan adınız `blvzeunit.com` https:// ile güvenli bir şekilde çalışır.

## 📋 İyzico Gereklilikleri

İyzico entegrasyonu için aşağıdaki gereklilikler karşılanmıştır:

### ✅ Tamamlananlar:
1. **SSL Sertifikası** - Netlify otomatik SSL
2. **Alan Adı** - blvzeunit.com
3. **Logo Eklemeleri**:
   - Footer'da "iyzico ile Öde" logosu (TR White versiyonu)
   - Footer'da Visa/Mastercard logo bandı
   - Checkout sayfasında "iyzico ile Öde" logosu
4. **Backend API** - Ödeme başlatma ve callback endpoint'leri
5. **Frontend Sayfalar** - Checkout ve payment callback sayfaları

### ⏳ İyzico API Bilgileri Bekleniyor:
API entegrasyonu hazır, ancak iyzico'dan aşağıdaki bilgilere ihtiyacınız var:

```env
IYZICO_API_KEY=sandbox-XXXXXXXXXXXXXXXX
IYZICO_SECRET_KEY=sandbox-XXXXXXXXXXXXXXXX
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com  # veya production için: https://api.iyzipay.com
```

## 🚀 Kurulum

### 1. Environment Variables Ayarlama

`.env.local` dosyanızı oluşturun ve iyzico API bilgilerinizi ekleyin:

```bash
# .env.local dosyasını oluşturun
cp .env.example .env.local
```

Ardından iyzico'dan aldığınız API anahtarlarını `.env.local` dosyasına ekleyin.

### 2. Netlify Environment Variables

Netlify dashboard'da aşağıdaki environment variables'ları ekleyin:
- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `IYZICO_BASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (zaten mevcut olmalı)

## 📁 Dosya Yapısı

```
netlify/
  functions/
    create-payment.ts         # Ödeme başlatma endpoint'i
    payment-callback.ts       # Ödeme doğrulama endpoint'i

src/
  pages/
    checkout/
      CheckoutPage.tsx        # Checkout sayfası (iyzico logosu eklendi)
      PaymentCallbackPage.tsx # Ödeme sonrası redirect sayfası

public/
  iyzico-logo-pack/
    checkout_iyzico_ile_ode/...
    footer_iyzico_ile_ode/...
```

## 🔄 Payment Flow

### 1. Checkout Sayfası
- Kullanıcı sipariş bilgilerini doldurur
- "Siparişi Tamamla" butonuna tıklar
- Form, sipariş veritabanına kaydedilir

### 2. İyzico Ödeme Başlatma (Yakında Entegre Edilecek)
```typescript
// Frontend'den çağrılacak
const response = await fetch('/.netlify/functions/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: '...',
    basketId: '...',
    price: '100.00',
    paidPrice: '100.00',
    currency: 'TRY',
    buyer: { /* ... */ },
    shippingAddress: { /* ... */ },
    billingAddress: { /* ... */ },
    basketItems: [{ /* ... */ }]
  })
});

const { token, paymentPageUrl } = await response.json();
// Kullanıcıyı iyzico ödeme sayfasına yönlendir
window.location.href = paymentPageUrl;
```

### 3. İyzico Ödeme Sayfası
- Kullanıcı iyzico'nun güvenli sayfasında kredi kartı bilgilerini girer
- 3D Secure doğrulama yapılır
- Ödeme tamamlanır

### 4. Payment Callback
- İyzico kullanıcıyı `/payment-callback?token=...` adresine yönlendirir
- Backend ödeme durumunu doğrular
- Başarılıysa sipariş durumu 'paid' olarak güncellenir
- Kullanıcıya sonuç gösterilir

## 🎨 Logo Kullanımı

### Footer Logo
```tsx
<img 
  src="/iyzico-logo-pack/checkout_iyzico_ile_ode/TR/Tr_White/iyzico_ile_ode_white.svg" 
  alt="iyzico ile Öde" 
/>
<img 
  src="/iyzico-logo-pack/footer_iyzico_ile_ode/White/logo_band_white.svg" 
  alt="Visa, Mastercard ve diğer ödeme yöntemleri" 
/>
```

### Checkout Logo
```tsx
<img 
  src="/iyzico-logo-pack/checkout_iyzico_ile_ode/TR/Tr_White/iyzico_ile_ode_white.png" 
  alt="iyzico ile güvenli ödeme" 
/>
```

## 🧪 Test

### Sandbox Ortamı
İyzico sandbox ortamında test kartları:
- **Kart No**: 5528790000000008
- **CVV**: 123
- **Son Kullanma**: 12/30
- **3D Şifre**: 123456

### Production
Production'a geçerken:
1. `IYZICO_BASE_URL`'i `https://api.iyzipay.com` olarak değiştirin
2. Production API anahtarlarını kullanın
3. İyzico'ya başvurunun onaylandığından emin olun

## 📞 Sonraki Adımlar

1. **İyzico'dan API bilgilerini alın**:
   - https://merchant.iyzipay.com adresinden başvuru yapın
   - Sandbox anahtarlarınızı alın
   - Environment variables'ları güncelleyin

2. **CheckoutPage.tsx'i Güncelleyin**:
   - Form submit'i iyzico payment flow'una bağlayın
   - Örnek entegrasyon kodu aşağıda

3. **Test Edin**:
   - Sandbox ortamında test kartlarıyla ödeme yapın
   - Callback sayfasını test edin
   - Sipariş durumlarının güncellendiğini doğrulayın

## 📝 İletişim

Herhangi bir sorunuz varsa:
- İyzico Destek: https://dev.iyzipay.com
- İyzico Dashboard: https://merchant.iyzipay.com
