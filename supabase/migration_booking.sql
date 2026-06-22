-- Tambah kolom bukti pembayaran ke tabel sewa
ALTER TABLE sewa ADD COLUMN IF NOT EXISTS bukti_pembayaran TEXT;
ALTER TABLE sewa ADD COLUMN IF NOT EXISTS sesi TEXT CHECK (sesi IN ('pagi', 'sore'));

-- Buat storage bucket untuk bukti pembayaran
-- Jalankan di Supabase Dashboard > Storage > New Bucket
-- Nama bucket: bukti-pembayaran, Public: true

-- Storage policy (jalankan setelah buat bucket):
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-pembayaran', 'bukti-pembayaran', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload bukti pembayaran"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bukti-pembayaran' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view bukti pembayaran"
ON storage.objects FOR SELECT
USING (bucket_id = 'bukti-pembayaran');
