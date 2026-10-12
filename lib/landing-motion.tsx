'use client'
import { useEffect } from 'react'

// Aparición al entrar en pantalla. Sin JS o con "reducir movimiento", todo se ve desde el inicio:
// la clase .motion (que oculta [data-reveal]) solo se pone si el navegador permite animar.
export function LandingMotion() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const root = document.documentElement
    root.classList.add('motion')
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    return () => { io.disconnect(); root.classList.remove('motion') }
  }, [])
  return null
}
