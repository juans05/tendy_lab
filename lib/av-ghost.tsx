// Fantasmín en SVG: gris cuando perdió sus colores, con manchas de color cuando el niño lo ayuda.
export function ghostSvg(colored: boolean) {
  const body = colored ? '#ffffff' : '#d9d6de'
  const spots = colored
    ? '<circle cx="62" cy="120" r="13" fill="#fe6900"/><circle cx="140" cy="104" r="10" fill="#461577"/><circle cx="118" cy="150" r="8" fill="#ffc857"/><circle cx="80" cy="160" r="7" fill="#2bb673"/>'
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
<ellipse cx="100" cy="212" rx="54" ry="7" fill="#000" opacity=".18"/>
<path d="M100 14c-44 0-74 34-74 80v96c0 6 7 9 12 5l14-12 14 12c4 3 9 3 13 0l14-12 14 12c4 3 9 3 13 0l14-12 14 12c4 3 9 3 13 0l14-12 14 12c5 4 12 1 12-5V94c0-46-30-80-74-80z" fill="${body}" stroke="#202020" stroke-width="5" stroke-linejoin="round"/>
${spots}
<ellipse cx="76" cy="86" rx="11" ry="15" fill="#202020"/><ellipse cx="124" cy="86" rx="11" ry="15" fill="#202020"/>
<circle cx="80" cy="80" r="4" fill="#fff"/><circle cx="128" cy="80" r="4" fill="#fff"/>
<path d="M84 116q16 ${colored ? 16 : 4} 32 0" fill="none" stroke="#202020" stroke-width="5" stroke-linecap="round"/>
${colored ? '<circle cx="62" cy="104" r="7" fill="#ff9d9d" opacity=".7"/><circle cx="138" cy="104" r="7" fill="#ff9d9d" opacity=".7"/>' : ''}
</svg>`
}
export const ghostSrc = (colored: boolean) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ghostSvg(colored))}`

export function Ghost({ colored = false, size = 160, src }: { colored?: boolean; size?: number; src?: string }) {
  return <img className="av-ghost" src={src ?? ghostSrc(colored)} width={size} height={size * 1.1} alt={colored ? 'Fantasmín con sus colores' : 'Fantasmín sin color'} />
}
