'use client'

import { useEffect, useRef, useState } from 'react'

export default function FadeIn({ 
  children, 
  delay = 0,
  direction = 'up' 
}: { 
  children: React.ReactNode, 
  delay?: number,
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    
    if (domRef.current) observer.observe(domRef.current)
    return () => observer.disconnect()
  }, [])

  let transform = ''
  if (direction === 'up') transform = 'translateY(40px)'
  if (direction === 'down') transform = 'translateY(-40px)'
  if (direction === 'left') transform = 'translateX(-40px)'
  if (direction === 'right') transform = 'translateX(40px)'

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : transform,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  )
}
