'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

const images = [
  { src: '/lapangan2.jpeg', label: 'Lapangan Standart' },
  { src: '/toilet.jpeg', label: 'Toilet Bersih' },
  { src: '/mushola.jpeg', label: 'Mushola' },
  { src: '/bench.jpeg', label: 'Bench Pemain' },
]

export default function FasilitasGallery() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <>
      {/* Grid Fasilitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((img, i) => (
          <div
            key={i}
            className="group relative h-[280px] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-zinc-200 cursor-pointer"
            onClick={() => setActive(i)}
          >
            <img
              src={img.src}
              alt={img.label}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            {/* Zoom icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3">
                <ZoomIn size={22} className="text-white" />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="w-8 h-1 bg-emerald-500 mb-3 rounded-full"></div>
              <h3 className="text-white text-lg font-bold font-bricolage leading-tight">
                {img.label}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setActive(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => setActive(null)}
          >
            <X size={20} />
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={images[active].src}
              alt={images[active].label}
              className="w-full h-full object-contain"
              style={{ maxHeight: '80vh' }}
            />
            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 px-6 py-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
              <div className="w-8 h-1 bg-emerald-500 mb-2 rounded-full"></div>
              <p className="text-white font-bold text-lg font-bricolage">{images[active].label}</p>
            </div>
          </div>

          {/* Prev / Next nav */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={e => { e.stopPropagation(); setActive((active - 1 + images.length) % images.length) }}
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={e => { e.stopPropagation(); setActive((active + 1) % images.length) }}
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setActive(i) }}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === active ? '#10b981' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
