-- Membuat tabel Keuangan untuk entri manual (pemasukan/pengeluaran)
CREATE TABLE IF NOT EXISTS keuangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  jumlah NUMERIC NOT NULL DEFAULT 0,
  keterangan TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Siapa admin yang menginput
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE keuangan ENABLE ROW LEVEL SECURITY;

-- Policy 1: Semua user yang sudah login bisa melihat laporan (SELECT)
CREATE POLICY "Anyone can view keuangan"
  ON keuangan FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 2: Hanya admin yang bisa membuat data (INSERT)
CREATE POLICY "Admins can insert keuangan"
  ON keuangan FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 3: Hanya admin yang bisa mengubah data (UPDATE)
CREATE POLICY "Admins can update keuangan"
  ON keuangan FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 4: Hanya admin yang bisa menghapus data (DELETE)
CREATE POLICY "Admins can delete keuangan"
  ON keuangan FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger untuk update_updated_at (menggunakan fungsi yang sudah ada di schema.sql)
CREATE TRIGGER update_keuangan_updated_at
  BEFORE UPDATE ON keuangan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
