import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone dan message harus diisi' },
        { status: 400 }
      )
    }

    const token = process.env.FONNTE_TOKEN
    if (!token) {
      console.error('FONNTE_TOKEN belum diatur di environment variable')
      return NextResponse.json(
        { error: 'Konfigurasi server bermasalah (Token tidak ditemukan)' },
        { status: 500 }
      )
    }

    // Fonnte API menggunakan FormData atau JSON, standardnya FormData
    const formData = new FormData()
    formData.append('target', phone)
    formData.append('message', message)
    formData.append('countryCode', '62') // Default ke kode negara Indonesia

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: formData,
    })

    const result = await response.json()

    if (result.status) {
      return NextResponse.json({ success: true, result })
    } else {
      console.error('Fonnte Error:', result)
      return NextResponse.json(
        { error: 'Gagal mengirim pesan via Fonnte', details: result },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API WhatsApp Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server', message: error.message },
      { status: 500 }
    )
  }
}
