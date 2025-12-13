
-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  status text default 'pending' check (status in ('pending', 'preparing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric not null,
  currency text default 'TRY',
  shipping_address jsonb not null,
  contact_info jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null,
  unit_price numeric not null,
  size text,
  product_name text, -- Snapshot of product name
  image_url text, -- Snapshot of image url
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies for orders
-- User can see their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Admins can view all orders (Assuming admin check is done via profile role or similar, adapting simplified version here)
-- Note: Replace with your actual admin check logic if different.
create policy "Admins can view all orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Guests might need to insert orders (if guest checkout is allowed)
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

-- Policies for order_items
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items"
  on public.order_items for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);
