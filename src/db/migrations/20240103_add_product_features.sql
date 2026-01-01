-- Add features column to products table (array of key-value pairs as JSONB)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Example: Add features to an existing product
-- UPDATE public.products 
-- SET features = '[
--   {"label": "Kumaş", "value": "100% Pamuk"},
--   {"label": "Kalıp", "value": "Oversize"},
--   {"label": "Yaka", "value": "Bisiklet Yaka"},
--   {"label": "Kol", "value": "Kısa Kol"}
-- ]'::jsonb
-- WHERE id = 'your-product-id';

-- Comment
COMMENT ON COLUMN public.products.features IS 'Array of product features as JSONB [{label, value}]';
