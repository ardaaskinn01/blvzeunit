
-- GUVENLIK GUNCELLEMESI: Orders Tablosu INSERT politikasi
-- Eski politika "Anyone can insert" siliniyor.
drop policy if exists "Anyone can insert orders" on public.orders;

-- Yeni politika: Kullanicilar sadece kendi adlarina siparis olusturabilir.
create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);
