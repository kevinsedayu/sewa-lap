'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Force play on mount to fix mobile Safari/Chrome autoplay restrictions
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn('Video autoplay failed:', error)
      })
    }
  }, [])

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      poster="/lapangan.jpeg"
      style={{ width: '100%', height: 'auto', display: 'block', filter: 'grayscale(10%)' }}
    >
      <source src="/vidlap3.webm" type="video/webm" />
    </video>
  )
}
