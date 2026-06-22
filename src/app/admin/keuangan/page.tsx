import { createClient } from '@/lib/supabase/server'
import KeuanganManager, { TransaksiKeuangan } from '@/components/shared/KeuanganManager'

export default async function AdminKeuanganPage() {
  const supabase = await createClient()

  // 1. Ambil data dari tabel keuangan (entri manual)
  const { data: manualData } = await supabase
    .from('keuangan')
    .select('*')
    .order('tanggal', { ascending: false })

  // 2. Ambil data dari tabel sewa (pemasukan otomatis dari booking yang selesai/dikonfirmasi)
  const { data: sewaData } = await supabase
    .from('sewa')
    .select('id, total_harga, tanggal, profiles(full_name)')
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
      sumber: 'Manual'
    }))
  }

  if (sewaData) {
    const sewaTransaksi: TransaksiKeuangan[] = sewaData.map(item => ({
      id: item.id,
      tipe: 'pemasukan',
      jumlah: Number(item.total_harga),
      keterangan: `Sewa oleh ${(item.profiles as any)?.full_name || 'User'}`,
      tanggal: item.tanggal,
      sumber: 'Sewa'
    }))
    semuaTransaksi = [...semuaTransaksi, ...sewaTransaksi]
  }

  // Urutkan berdasarkan tanggal terbaru
  semuaTransaksi.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

  // Hitung total awal
  const totalPemasukan = semuaTransaksi.filter(t => t.tipe === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0)
  const totalPengeluaran = semuaTransaksi.filter(t => t.tipe === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0)

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
          Laporan Keuangan
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Kelola arus kas, pengeluaran, dan pendapatan lapangan.
        </p>
      </div>

      <KeuanganManager 
        isAdmin={true} 
        initialTransaksi={semuaTransaksi} 
        totalPemasukan={totalPemasukan} 
        totalPengeluaran={totalPengeluaran} 
      />
    </div>
  )
}
