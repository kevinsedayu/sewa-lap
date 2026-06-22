# Sistem Penyewaan Lapangan Sepakbola

Platform booking lapangan sepakbola berbasis **Next.js 14** + **Supabase**.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Inline CSS (Modern Minimalist)
- **Language**: TypeScript

## Setup

### 1. Install Dependencies
Pastikan disk memiliki cukup ruang kosong (min. ~500MB), lalu:
```bash
npm install
```

### 2. Konfigurasi Supabase
Salin file env dan isi credentials:
```bash
copy .env.local.example .env.local
```
Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda → **SQL Editor**
3. Copy-paste isi file `supabase/schema.sql` dan jalankan

### 4. Buat Akun Admin
Setelah register via `/register`, jalankan query ini di SQL Editor:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email-admin-anda@gmail.com'
);
```

### 5. Jalankan Dev Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

## Struktur Halaman
| URL | Akses | Deskripsi |
|-----|-------|-----------|
| `/login` | Public | Halaman login |
| `/register` | Public | Halaman registrasi user |
| `/admin/dashboard` | Admin only | Dashboard admin |
| `/user/dashboard` | User only | Dashboard user |

## Struktur Folder
```
src/
├── app/
│   ├── (auth)/login/      ← Login page
│   ├── (auth)/register/   ← Register page
│   ├── (auth)/actions.ts  ← Server actions auth
│   ├── (admin)/           ← Admin protected routes
│   ├── (user)/            ← User protected routes
│   └── auth/callback/     ← Supabase OAuth callback
├── components/
│   ├── admin/AdminSidebar.tsx
│   └── user/UserSidebar.tsx
├── lib/supabase/
│   ├── client.ts          ← Browser client
│   └── server.ts          ← Server client
└── middleware.ts           ← Route protection
```
