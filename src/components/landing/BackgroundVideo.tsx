'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Force play — fix autoplay restrictions di mobile Safari/Chrome
    const tryPlay = () => {
      video.play().catch(() => {
        // Jika autoplay gagal, tampilkan foto fallback
        setVideoFailed(true)
      })
    }

    // Coba play saat komponen mount
    tryPlay()

    // Jika video error load (file tidak ditemukan / format tidak support)
    video.addEventListener('error', () => setVideoFailed(true))

    // Pastikan video selalu loop — backup selain atribut loop
    video.addEventListener('ended', () => {
      video.currentTime = 0
      video.play().catch(() => {})
    })

    return () => {
      video.removeEventListener('error', () => setVideoFailed(true))
    }
  }, [])

  const coverStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    filter: 'grayscale(10%)',
  }

  // Jika video gagal total → tampilkan foto lapangan yang tidak terpotong
  if (videoFailed) {
    return (
      <img
        src="/lapangan.jpeg"
        alt="Lapangan Gelora Bumi Mintarsih"
        style={coverStyle}
      />
    )
  }

  return (
    <>
      {/* Video utama */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={coverStyle}
      >
        {/* WebM lebih kecil → prioritas utama */}
        <source src="/vidlap3.webm" type="video/webm" />
        {/* MP4 sebagai fallback jika WebM tidak support */}
        <source src="/vidlap3.mp4" type="video/mp4" />
      </video>

      {/* Foto fallback jika video belum load — tidak terpotong karena pakai object-fit: cover */}
      <img
        src="/lapangan.jpeg"
        alt="Lapangan Gelora Bumi Mintarsih"
        aria-hidden="true"
        style={{
          ...coverStyle,
          zIndex: -1, // di belakang video
        }}
      />
    </>
  )
}
