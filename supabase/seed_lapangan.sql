-- Masukkan data lapangan default jika masih kosong
INSERT INTO lapangan (id, nama, lokasi, harga, deskripsi)
SELECT 
    gen_random_uuid(), 
    'Lapangan Utama SewaLapangan', 
    'Pusat Kota', 
    150000, 
    'Lapangan Sepakbola dengan fasilitas lengkap'
WHERE NOT EXISTS (
    SELECT 1 FROM lapangan LIMIT 1
);
