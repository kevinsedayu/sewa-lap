-- Tambahkan izin agar Admin bisa mengubah peran (role) pengguna lain di tabel profiles

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
