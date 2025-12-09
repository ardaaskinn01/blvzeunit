# Supabase Setup Checklist

## 1. Database Migrations (Supabase Dashboard'da yapılacak)

Aşağıdaki SQL'i **SQL Editor** üzerinden çalıştırın:

```sql
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
```

## 2. Google OAuth Yapılandırması

1. **Google Cloud Console'da:**
   - https://console.cloud.google.com/ açın
   - OAuth 2.0 Client ID oluşturun
   - **Authorized JavaScript origins:**
     - `http://localhost:5175`
     - `http://localhost:5174`
     - `https://your-domain.com` (production)
   
   - **Authorized redirect URIs:**
     - `https://wsrtrnvfzuarpswkrlgz.supabase.co/auth/v1/callback`

2. **Supabase Dashboard'da:**
   - Authentication > Providers > Google
   - **Enable** butonuna tıklayın
   - Client ID ve Client Secret'ı girin
   - Save

## 3. URL Configuration (Supabase Dashboard)

Authentication > URL Configuration:
- **Site URL:** `http://localhost:5175` (development) / `https://your-domain.com` (production)
- **Redirect URLs:** 
  - `http://localhost:5175`
  - `https://your-domain.com` (production)

## 4. Environment Variables (.env.local)

Projeniz zaten şunları içeriyor:

```env
VITE_SUPABASE_URL="https://wsrtrnvfzuarpswkrlgz.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_ZthOeM6-Z8AA3elL-XQbgw_Ger1UuBC"
VITE_RESEND_API_KEY="re_MqwGHnqA_MBMGY4vmFTroqi3wUahK8UAc"
VITE_CONTACT_EMAIL="ardaaskindm@gmail.com"
```

## 5. Admin Kullanıcı Oluşturma

Kendinizi admin yapmak için:

1. **Supabase Dashboard:**
   - Authentication > Users
   - Kendi user'ınızı bulun
   
2. **SQL Editor'da çalıştırın:**
```sql
update profiles 
set role = 'admin' 
where email = 'your-email@example.com';
```

## 6. Test Etme

### Local'de Test:
1. `npm run dev` ile dev server başlatın
2. `http://localhost:5175` açın
3. `/login` sayfasına gidin
4. Email/password ile kayıt olun veya Google ile giriş yapın
5. **Başarılı olması için kontrol edin:**
   - Navbar'da "Hesabım" butonu görünüyor mu?
   - `/account` sayfasında profil bilgileri görünüyor mu?
   - Admin iseniz `/admin` dashboard'a erişebiliyor musunuz?

### Admin Test:
1. Supabase Dashboard'da profilinizin role'ünü 'admin' yapın
2. Login yap
3. Navbar'da "Admin Dashboard" linki görünmeleri gerekir
4. `/admin` sayfasında tüm kullanıcıları yönetem

## 7. Production Deployment

Netlify'a deploy etmeden:

1. Google Cloud OAuth redirect URI'lerini production domain'e ekleyin
2. Supabase URL Configuration'da production domain'i ekleyin
3. `.env.local` dosyasını `.env.example` olarak commit edin (credentials commit etmeyin)
4. Netlify environment variables'ında VITE_ prefix'li tüm değişkenleri ekleyin

## Troubleshooting

### Profiles table'a otomatik kayıt olmuyorsa
- Supabase Dashboard > Functions > handle_new_user trigger'ını kontrol edin
- Trigger'ın active olduğunu kontrol edin

### Google giriş çalışmıyorsa
- Google Cloud Console'da OAuth credentials doğru mu?
- Supabase'de Google provider enabled mi?
- Redirect URL'ler doğru mu?

### Admin dashboard erişemiyorsa
- Profilinizin role'ü 'admin' mi?
- Supabase RLS policies doğru mu?

### Session expire sorunu
- Browser cookies'yi temizleyin
- Application > Cookies seçin
- Sayfayı yeniden yükleyin
