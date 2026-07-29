'use client'

export default function BackgroundVideo() {
  return (
    <img
      src="/vidlap3.gif"
      alt="Background Lapangan"
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover', 
        display: 'block', 
        filter: 'grayscale(10%)' 
      }}
    />
  )
}
