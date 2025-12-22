-- Payment Idempotency Migration
-- Prevents duplicate payments by ensuring unique iyzico_payment_id

-- Add unique constraint (allows NULL values, but prevents duplicate non-NULL values)
ALTER TABLE orders 
ADD CONSTRAINT unique_iyzico_payment_id 
UNIQUE NULLS NOT DISTINCT (iyzico_payment_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_id 
ON orders(iyzico_payment_id) 
WHERE iyzico_payment_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON CONSTRAINT unique_iyzico_payment_id ON orders IS 
'Prevents duplicate payments by ensuring each iyzico_payment_id is unique';
