import './globals.css'
import localFont from 'next/font/local'

// Fuentes locales (latin, variables): el build no depende de Google Fonts.
const display = localFont({ src: './fonts/BricolageGrotesque.woff2', variable: '--font-display', weight: '600 800' })
const body = localFont({ src: './fonts/Manrope.woff2', variable: '--font-body', weight: '400 800' })

export const metadata = {
  title: 'TendyLab Tools',
  description: 'Sube lo que quieres vender. TendyLab Tools te dice qué mejorar y qué crear después.',
}

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
