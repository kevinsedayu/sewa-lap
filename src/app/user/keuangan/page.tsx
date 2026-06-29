import { createClient } from '@/lib/supabase/server'
import KeuanganManager, { TransaksiKeuangan } from '@/components/shared/KeuanganManager'

export default async function UserKeuanganPage() {
  const supabase = await createClient()

  // 1. Ambil data manual dari tabel keuangan
  const { data: manualData } = await supabase
    .from('keuangan')
    .select('*')
    .order('tanggal', { ascending: false })

  // 2. Ambil data pemasukan otomatis dari tabel sewa
  // Karena RLS sewa sudah di-set public untuk SELECT (seperti di kalender),
  // kita bisa fetch semuanya, namun kita tidak butuh user_id untuk user biasa.
  // Tapi untuk konsistensi dengan tampilan admin, kita coba ambil namanya jika RLS mengizinkan.
  // Jika RLS membatasi, kita akan fallback ke "User"
  const { data: sewaData } = await supabase
    .from('sewa')
    .select('id, total_harga, tanggal, created_at')
    .in('status', ['completed', 'confirmed'])

  // Gabungkan dan format data
  let semuaTransaksi: TransaksiKeuangan[] = []

  if (manualData) {
    semuaTransaksi = manualData.map(item => ({
      id: item.id,
      tipe: item.tipe,
      jumlah: Number(item.jumlah),
      keterangan: item.keterangan,
      tanggal: item.tanggal,
      created_at: item.created_at,
      sumber: 'Manual'
    }))
  }

  if (sewaData) {
    const sewaTransaksi: TransaksiKeuangan[] = sewaData.map(item => ({
      id: item.id,
      tipe: 'pemasukan',
      jumlah: Number(item.total_harga),
      keterangan: `Sewa Lapangan`, // Disamarkan untuk privasi user
      tanggal: item.tanggal,
      created_at: item.created_at,
      sumber: 'Sewa'
    }))
    semuaTransaksi = [...semuaTransaksi, ...sewaTransaksi]
  }

  // Urutkan berdasarkan tanggal terbaru, lalu created_at terbaru
  semuaTransaksi.sort((a, b) => {
    const dateDiff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })

  // Hitung total awal
  const totalPemasukan = semuaTransaksi.filter(t => t.tipe === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0)
  const totalPengeluaran = semuaTransaksi.filter(t => t.tipe === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0)

  return (
    <div className="page-content" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
          Transparansi Keuangan
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Laporan keuangan terbuka mengenai pendapatan dan biaya operasional lapangan.
        </p>
      </div>

      <KeuanganManager 
        isAdmin={false} // User tidak bisa mengedit
        initialTransaksi={semuaTransaksi} 
        totalPemasukan={totalPemasukan} 
        totalPengeluaran={totalPengeluaran} 
      />
    </div>
  )
}
