import localFont from 'next/font/local'

// Tipografía de la portada y la clase gratis (dirección "Mercado"). El panel sigue con Bricolage y Manrope.
const display = localFont({ src: '../app/fonts/ArchivoBlack.woff2', weight: '400', variable: '--mk-display' })
const body = localFont({ src: '../app/fonts/Archivo.woff2', weight: '100 900', variable: '--mk-body' })
export const mercadoFonts = `${display.variable} ${body.variable}`
