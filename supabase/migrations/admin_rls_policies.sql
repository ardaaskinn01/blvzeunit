-- Admin RLS Policies for Products, Categories, and Product Variants
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- ============================================
-- PRODUCTS TABLE RLS POLICIES
-- ============================================

-- Enable RLS on products table (eğer yoksa)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Herkes ürünleri görebilir (public read)
CREATE POLICY IF NOT EXISTS "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Admin tüm ürünleri ekleyebilir
CREATE POLICY IF NOT EXISTS "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin tüm ürünleri güncelleyebilir
CREATE POLICY IF NOT EXISTS "Admins can update products"
  ON products FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin tüm ürünleri silebilir
CREATE POLICY IF NOT EXISTS "Admins can delete products"
  ON products FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- CATEGORIES TABLE RLS POLICIES
-- ============================================

-- Enable RLS on categories table (eğer yoksa)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Herkes kategorileri görebilir (public read)
CREATE POLICY IF NOT EXISTS "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Admin kategorileri ekleyebilir
CREATE POLICY IF NOT EXISTS "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin kategorileri güncelleyebilir
CREATE POLICY IF NOT EXISTS "Admins can update categories"
  ON categories FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin kategorileri silebilir
CREATE POLICY IF NOT EXISTS "Admins can delete categories"
  ON categories FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- PRODUCT_VARIANTS TABLE RLS POLICIES
-- ============================================

-- Enable RLS on product_variants table (eğer yoksa)
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Herkes varyantları görebilir (public read)
CREATE POLICY IF NOT EXISTS "Product variants are viewable by everyone"
  ON product_variants FOR SELECT
  USING (true);

-- Admin varyantları ekleyebilir
CREATE POLICY IF NOT EXISTS "Admins can insert product variants"
  ON product_variants FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin varyantları güncelleyebilir
CREATE POLICY IF NOT EXISTS "Admins can update product variants"
  ON product_variants FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin varyantları silebilir
CREATE POLICY IF NOT EXISTS "Admins can delete product variants"
  ON product_variants FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- PROFILES TABLE - Admin Update/Delete Policies
-- ============================================

-- Admin tüm profilleri güncelleyebilir (zaten var olabilir, IF NOT EXISTS ile kontrol edilir)
CREATE POLICY IF NOT EXISTS "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admin tüm profilleri silebilir
CREATE POLICY IF NOT EXISTS "Admins can delete all profiles"
  ON profiles FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

