# Ürün Galeri Özelliği - Kullanım Kılavuzu

## Yapılan Değişiklikler

### 1. Veritabanı
SQL Editör'de çalıştırmanız gereken migration:
```sql
-- Dosya: src/db/migrations/20240102_add_additional_images.sql
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS additional_images TEXT[];
```

### 2. Admin Dashboard
- **Ek Görsel Yükleme**: Ürün eklerken/düzenlerken "Ek Görseller (Galeri)" bölümünden birden fazla görsel yükleyebilirsiniz
- **Önizleme**: Yüklenen görseller küçük önizlemeler olarak gösterilir
- **Silme**: Her görselin üstündeki × butonuyla silebilirsiniz
- **Ana Görsel**: İlk görsel hala "Ürün Görseli" bölümünden yüklenir

### 3. Product Page (Ürün Sayfası)
- **Ana Görsel**: Büyük görsel alanında seçili görsel gösterilir
- **Thumbnail Galeri**: Ana görselin altında küçük görseller (thumbnails) gösterilir
- **Tıklanabilir**: Küçük görsellere tıklayınca ana görselin yerini alır
- **Seçili Görsel**: Aktif görsel kalın siyah border ile vurgulanır

## Kullanım Adımları

### Admin Panelinde Ürün Ekleme/Düzenleme:
1. Admin Dashboard > Ürünler sekmesine gidin
2. "Yeni Ürün Ekle" veya mevcut ürünü "Düzenle"
3. "Ürün Görseli" bölümünden ana görseli yükleyin
4. "Ek Görseller (Galeri)" bölümünden birden fazla görsel seçin
5. Önizlemeleri kontrol edin, istemediğiniz görselleri × ile silin
6. "Kaydet" butonuna tıklayın

### Müşteri Görünümü (Product Page):
- Ürün sayfasında ana görsel büyük olarak gösterilir
- Altında tüm görsellerin küçük halleri (thumbnails) yer alır
- Küçük görsellere tıklayarak ana görseli değiştirebilirsiniz
- Seçili görsel kalın border ile vurgulanır

## Teknik Detaylar
- **Dosya Formatı**: PNG, JPG, GIF
- **Maksimum Boyut**: Her görsel için 5MB
- **Çoklu Yükleme**: Birden fazla görsel aynı anda seçilebilir
- **Depolama**: Supabase Storage (products bucket)
- **Veritabanı**: PostgreSQL TEXT[] array olarak saklanır
