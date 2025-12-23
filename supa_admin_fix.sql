-- BU KODU SUPABASE SQL EDITOR'ÜNDE ÇALIŞTIRIN --
-- RUN THIS IN SUPABASE SQL EDITOR --

-- 1. Güvenli Admin Kontrol Fonksiyonu Oluştur
-- Bu fonksiyon, RLS politikaları içinde sonsuz döngüye girmeden admin rolünü kontrol etmemizi sağlar.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bu, fonksiyonun çağıranın değil, oluşturucunun (postgres/admin) yetkileriyle çalışmasını sağlar
SET search_path = public -- Güvenlik için search_path'i sabitle
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 2. Profiles (Kullanıcılar) Tablosu İçin Politikalar
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eski politikaları temizle (varsa)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Yeni Politikalar:
-- A. Herkes kendi profilini görebilir
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- B. Adminler TÜM profilleri görebilir
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- C. Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. Orders (Siparişler) Tablosu İçin Politikalar
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- A. Kullanıcılar sadece kendi siparişlerini görebilir
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- B. Adminler TÜM siparişleri görebilir, düzenleyebilir, silebilir
CREATE POLICY "Admins can perform all on orders"
ON public.orders FOR ALL
USING (public.is_admin());

-- 4. Order Items (Sipariş Kalemleri) Tablosu İçin Politikalar
-- (Bazen sipariş detayları ayrı bir tabloda tutulur, buna da erişim gerekir)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- A. Sipariş sahibi sipariş kalemlerini görebilir
-- (Not: Bu biraz karmaşık olabilir, basitçe siparişin sahibi mi diye bakıyoruz)
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- B. Adminler her şeyi görebilir
CREATE POLICY "Admins can view all order items"
ON public.order_items FOR ALL
USING (public.is_admin());

-- 5. Products, Categories, Discounts (Yönetim Yetkileri)
-- Genellikle bunlar herkese açıktır (SELECT), ama sadece adminler düzenleyebilir (INSERT, UPDATE, DELETE)

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (public.is_admin());

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL USING (public.is_admin());

-- Discounts
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
-- İndirimleri herkesin görmesi gerekebilir (sepet hesabı için) veya saklanabilir.
-- Şimdilik adminler yönetsin:
CREATE POLICY "Admin full access discounts" ON public.discounts FOR ALL USING (public.is_admin());
-- Eğer public okuma lazımsa buraya ekleyin.
