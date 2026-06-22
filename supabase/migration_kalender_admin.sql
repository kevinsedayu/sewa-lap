-- Menambahkan kolom catatan pada tabel sewa untuk menampung keterangan perawatan / libur
ALTER TABLE sewa ADD COLUMN IF NOT EXISTS catatan TEXT;

-- (Opsional) Mengupdate RLS jika diperlukan, namun RLS sebelumnya sudah cukup karena Admin bebas INSERT & UPDATE
