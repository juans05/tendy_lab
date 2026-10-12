import './globals.css'
import { Bricolage_Grotesque, Manrope } from 'next/font/google'

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', weight: ['600', '700', '800'] })
const body = Manrope({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600', '700', '800'] })

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
