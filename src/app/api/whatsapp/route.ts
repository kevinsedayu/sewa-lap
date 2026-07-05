import { NextResponse } from 'next/server'

const WABLAS_API_HOST = process.env.WABLAS_API_HOST || 'https://smg.wablas.com'
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || 'fd3RsoJCYHGShHuvvBOiuvlfTjcMcjCR3O69mFj8jLmdJPqYMwDhn8c'
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || 'sEWYnSAK'

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone dan message harus diisi' },
        { status: 400 }
      )
    }

    // 4. Jika nomor diawali 08, ubah otomatis menjadi 62 sebelum dikirim
    let formattedPhone = phone
    if (formattedPhone.startsWith('08')) {
      formattedPhone = '628' + formattedPhone.slice(2)
    }

    // Menggunakan endpoint Wablas v2
    const url = `${WABLAS_API_HOST.replace(/\/$/, '')}/api/v2/send-message`
    
    // Format Header Wablas dengan Secret Key: Authorization: {token}.{secret_key}
    const authHeader = WABLAS_SECRET_KEY ? `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}` : WABLAS_TOKEN

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        data: [
          {
            phone: formattedPhone,
            message: message,
          }
        ]
      }),
    })

    const resultText = await response.text()
    let result: any
    try {
      result = JSON.parse(resultText)
    } catch {
      result = { raw: resultText }
    }

    if (response.ok && result.status !== false) {
      return NextResponse.json({ success: true, result })
    } else {
      console.error('Wablas API Error:', response.status, result)
      return NextResponse.json(
        { error: 'Gagal mengirim pesan WhatsApp', status: response.status, details: result },
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

