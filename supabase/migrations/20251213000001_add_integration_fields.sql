
-- Add integration fields to orders table
alter table public.orders 
add column if not exists payment_provider text default 'iyzico',
add column if not exists payment_id text,
add column if not exists payment_status text default 'pending',
add column if not exists conversation_id text,
add column if not exists parasut_invoice_id text,
add column if not exists parasut_invoice_url text,
add column if not exists cargo_tracking_number text,
add column if not exists cargo_tracking_url text,
add column if not exists shipment_label_url text;

-- Add index for search optimization
create index if not exists orders_payment_id_idx on public.orders(payment_id);
