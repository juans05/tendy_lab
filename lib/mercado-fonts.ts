import { Archivo, Archivo_Black } from 'next/font/google'

// Tipografía de la portada y la clase gratis (dirección "Mercado"). El panel sigue con Bricolage y Manrope.
const display = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--mk-display' })
const body = Archivo({ subsets: ['latin'], weight: ['400', '600', '800'], variable: '--mk-body' })
export const mercadoFonts = `${display.variable} ${body.variable}`
