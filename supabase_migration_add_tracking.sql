-- Add MNG Kargo tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cargo_tracking_number text,
ADD COLUMN IF NOT EXISTS cargo_tracking_url text,
ADD COLUMN IF NOT EXISTS shipment_label_url text;
