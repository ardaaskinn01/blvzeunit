-- Profiles table'ı oluştur (eğer yoksa)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'guest' check (role in ('guest', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies: Herkes kendi profilini görebilir
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Policies: Herkes kendi profilini güncelleyebilir
create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- Policies: Admin tüm profilleri görebilir
create policy "Admins can view all profiles"
  on profiles for select
  using ( (select role from profiles where id = auth.uid()) = 'admin' );

-- Trigger: Auth'da yeni user oluşunca profiles'a ekle
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'guest'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger'ı auth.users'e ekle
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: User role'ünü kontrol et
create or replace function public.is_admin()
returns boolean as $$
begin
  return (select role from profiles where id = auth.uid()) = 'admin';
end;
$$ language plpgsql security definer;
