-- 1. Önce payment_id sütunu yoksa ekleyelim
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id text;

-- 2. payment_id sütunu için unique constraint ekleyelim
-- Önce varsa eski constraint'i düşürelim ki hata vermesin
ALTER TABLE orders DROP CONSTRAINT IF EXISTS unique_iyzico_payment_id;

-- Şimdi constraint'i ekleyelim
ALTER TABLE orders 
ADD CONSTRAINT unique_iyzico_payment_id UNIQUE (payment_id);

-- 3. İndeks oluşturalım (hızlı sorgulama için)
DROP INDEX IF EXISTS idx_orders_payment_id;
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
