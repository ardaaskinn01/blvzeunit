-- Add additional_images column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS additional_images TEXT[];

-- Add comment
COMMENT ON COLUMN public.products.additional_images IS 'Array of additional product image URLs';
