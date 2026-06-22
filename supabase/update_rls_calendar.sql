-- Update RLS Kebijakan (Policy) agar semua orang bisa melihat jadwal mana yang kosong/penuh
-- Tenang saja, data sensitif (nama, bukti pembayaran) tidak akan ditampilkan di halaman User, hanya ketersediaan tanggalnya saja.

DROP POLICY IF EXISTS "Users can view own bookings" ON sewa;

CREATE POLICY "Anyone can view bookings for calendar"
  ON sewa FOR SELECT
  USING (true);
