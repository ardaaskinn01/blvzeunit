-- RLS Hatasını Giderme: Misafir ve Kayıtlı Kullanıcı Sipariş İzni
-- Bu sorguyu Supabase Dashboard -> SQL Editor kısmında çalıştırın.

-- 1. Orders tablosundaki mevcut kısıtlayıcı politikayı kaldır
drop policy if exists "Users can insert own orders" on public.orders;
drop policy if exists "Anyone can insert orders" on public.orders;

-- 2. Yeni esnek politika ekle: 
-- Giriş yapanlar kendi adına (auth.uid() = user_id) 
-- Giriş yapmayanlar (user_id IS NULL) sipariş oluşturabilsin
create policy "Users and guests can insert orders"
  on public.orders for insert
  with check (
    (auth.uid() = user_id) OR (user_id IS NULL)
  );

-- 3. Order Items tablosu için de kontrol (Genelde 'Anyone can insert' yeterlidir)
drop policy if exists "Anyone can insert order items" on public.order_items;
create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);

-- 4. Adminlerin her şeyi görmeye devam ettiğinden emin olalım (Opsiyonel)
-- create_orders.sql'de zaten vardı ama garantiye alalım
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
