# Admin RLS Politikaları Kurulumu

Admin dashboard'un çalışması için `products`, `categories` ve `product_variants` tablolarına RLS (Row Level Security) politikaları eklenmesi gerekiyor.

## Adımlar

### 1. Supabase Dashboard'a Giriş Yapın
- https://supabase.com/dashboard adresine gidin
- Projenizi seçin

### 2. SQL Editor'ı Açın
- Sol menüden **SQL Editor** seçeneğine tıklayın
- **New Query** butonuna tıklayın

### 3. SQL Dosyasını Çalıştırın
- `supabase/migrations/admin_rls_policies.sql` dosyasının içeriğini kopyalayın
- SQL Editor'a yapıştırın
- **RUN** butonuna tıklayın (veya `Ctrl+Enter`)

### 4. Sonuçları Kontrol Edin
- Başarılı olursa "Success. No rows returned" mesajı görünecek
- Hata varsa, hata mesajını kontrol edin

## Politikalar Ne Yapıyor?

### Products Tablosu
- ✅ Herkes ürünleri görebilir (public read)
- ✅ Admin ürün ekleyebilir
- ✅ Admin ürün güncelleyebilir
- ✅ Admin ürün silebilir

### Categories Tablosu
- ✅ Herkes kategorileri görebilir (public read)
- ✅ Admin kategori ekleyebilir
- ✅ Admin kategori güncelleyebilir
- ✅ Admin kategori silebilir

### Product Variants Tablosu
- ✅ Herkes varyantları görebilir (public read)
- ✅ Admin varyant ekleyebilir
- ✅ Admin varyant güncelleyebilir
- ✅ Admin varyant silebilir

### Profiles Tablosu
- ✅ Admin tüm profilleri güncelleyebilir
- ✅ Admin tüm profilleri silebilir

## Sorun Giderme

### "Policy already exists" Hatası
- Bu normal, politikalar zaten var demektir
- `IF NOT EXISTS` kullanıldığı için hata vermez

### "Permission denied" Hatası
- Kendi kullanıcınızın admin olduğundan emin olun:
  ```sql
  SELECT id, email, role FROM profiles WHERE id = auth.uid();
  ```
- Admin değilseniz:
  ```sql
  UPDATE profiles 
  SET role = 'admin' 
  WHERE email = 'your-email@example.com';
  ```

### Veriler Hala Yüklenmiyor
1. Browser console'u açın (F12)
2. Network tab'ına bakın
3. Supabase isteklerini kontrol edin
4. Hata mesajlarını kontrol edin

## Test Etme

SQL çalıştırdıktan sonra:
1. Admin dashboard'a giriş yapın
2. Browser console'u açın (F12)
3. Verilerin yüklendiğini kontrol edin
4. Herhangi bir hata mesajı varsa not edin

