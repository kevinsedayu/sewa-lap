'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export default function FadeIn({ children, delay = 0, direction = 'up' }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Unobserve once it becomes visible so it doesn't animate out and in repeatedly
          if (domRef.current) observer.unobserve(domRef.current)
        }
      })
    }, { threshold: 0.15 }) // Trigger when 15% of the element is visible

    if (domRef.current) {
      observer.observe(domRef.current)
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current)
    }
  }, [])

  // Setup initial translation based on direction
  let transform = 'translate-y-10'
  if (direction === 'down') transform = '-translate-y-10'
  if (direction === 'left') transform = 'translate-x-10'
  if (direction === 'right') transform = '-translate-x-10'
  if (direction === 'none') transform = 'translate-x-0 translate-y-0'

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${transform}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
