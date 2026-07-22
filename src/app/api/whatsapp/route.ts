import { NextResponse } from 'next/server'

const WA_API_URL = process.env.WA_API_URL || 'https://silent-asleep-supermom.ngrok-free.dev/api/message/send'
const WA_API_KEY = process.env.WA_API_KEY || 'wakey_26a585fed2fd468992fb56f9b640f470'
const WA_SESSION = process.env.WA_SESSION || 'kvn'

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone dan message harus diisi' },
        { status: 400 }
      )
    }

    const response = await fetch(WA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': WA_API_KEY,
        'ngrok-skip-browser-warning': '1',
      },
      body: JSON.stringify({ to: phone, text: message, session: WA_SESSION }),
    })

    const resultText = await response.text()
    let result: any
    try {
      result = JSON.parse(resultText)
    } catch {
      result = { raw: resultText }
    }

    if (response.ok) {
      return NextResponse.json({ success: true, result })
    } else {
      console.error('WA API Error:', response.status, result)
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
