-- =============================================
-- SCHEMA: Sistem Penyewaan Lapangan Sepakbola
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. TRIGGER: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. LAPANGAN TABLE
CREATE TABLE IF NOT EXISTS lapangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  deskripsi TEXT,
  alamat TEXT,
  harga_per_jam NUMERIC NOT NULL DEFAULT 0,
  foto_url TEXT,
  fasilitas TEXT[],
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lapangan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active lapangan"
  ON lapangan FOR SELECT
  USING (status = 'aktif');

CREATE POLICY "Admins can manage lapangan"
  ON lapangan FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. SEWA (BOOKING) TABLE
CREATE TABLE IF NOT EXISTS sewa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lapangan_id UUID REFERENCES lapangan(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  total_harga NUMERIC NOT NULL DEFAULT 0,
  catatan TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sewa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON sewa FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create booking"
  ON sewa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own booking"
  ON sewa FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings"
  ON sewa FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. HELPER FUNCTION: updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lapangan_updated_at
  BEFORE UPDATE ON lapangan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sewa_updated_at
  BEFORE UPDATE ON sewa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- CARA MEMBUAT ADMIN PERTAMA:
-- 1. Register akun baru via /register
-- 2. Kemudian jalankan query berikut di SQL Editor
--    (ganti email dengan email admin Anda):
--
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'admin@youremail.com'
-- );
-- =============================================
