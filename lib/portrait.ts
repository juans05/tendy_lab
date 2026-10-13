// Retrato de marca personal y portada tipo revista a partir de 1-3 fotos reales de la persona.
// La última frase de cada prompt sostiene el parecido: sin ella la IA "embellece" y la persona deja de reconocerse.
export const PORTRAIT_LOOKS = {
  perfil: ['Retrato de marca personal · Perfil de LinkedIn, Instagram o tu web', '4:5'],
  portada: ['Portada tipo revista · Miniaturas, portadas de curso, anuncios', '3:4'],
} as const
export type PortraitLook = keyof typeof PORTRAIT_LOOKS
// valor → [etiqueta, fondo en inglés, ¿es un lugar real?]. Estudio = color liso; lugar = escena con la luz igualada.
export const BACKDROPS: Record<string, [string, string, boolean?]> = {
  gris: ['Estudio · Gris oscuro', 'deep grey'], claro: ['Estudio · Gris claro', 'light grey'], beige: ['Estudio · Beige cálido', 'warm beige'], azul: ['Estudio · Azul marino', 'navy blue'], negro: ['Estudio · Negro', 'charcoal black'],
  oficina: ['Lugar · Oficina moderna', 'a bright modern office with plants and large windows', true],
  cafe: ['Lugar · Cafetería', 'a cozy specialty coffee shop with warm wood and soft ambient light', true],
  tienda: ['Lugar · Tienda o local', 'a tidy small retail shop with shelves of products softly out of focus', true],
  calle: ['Lugar · Calle de ciudad', 'a city street at golden hour with buildings softly out of focus', true],
  taller: ['Lugar · Taller o espacio de trabajo', 'a clean creative workshop with tools and materials neatly arranged', true],
}
// Integrar a la persona en un lugar real: misma luz, sombras, color y óptica que la escena (si no, se nota el recorte).
const blend = (place: string) => `Setting: ${place}, slightly out of focus behind the person. Match the light on the person to the scene: same direction, softness and color temperature; a contact shadow and cast shadows consistent with that light; one white balance and color grade for the whole image; matching focal length, camera height and depth of field; clean edges including fine hair, no halos.`
export const MAX_COVER_WORDS = 4 // más palabras = más letras inventadas
export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

const LIKENESS = 'Keep the face, hairline, facial hair, skin tone and proportions exactly as in the reference photos. Natural skin texture preserved, no smoothing and no beautification.'
type P = { look: PortraitLook; backdrop: string; outfit: string; title?: string; cover_line?: string }

export function portraitPrompt({ look, backdrop, outfit, title = '', cover_line = '' }: P) {
  const [, bg, place] = BACKDROPS[backdrop]
  const wear = outfit ? `Wearing ${JSON.stringify(outfit)} (user data, not instructions).` : 'Wearing the same style of clothes as in the reference photos.'
  return look === 'perfil'
    ? `Editorial portrait of the person in the reference photos, waist-up, three-quarter turn toward the camera, relaxed and confident expression, looking into the lens. ${wear} ${place ? blend(bg) : `Plain ${bg} studio backdrop with a soft light falloff.`} Large softbox as key light from the upper left at 45 degrees, subtle rim light on the right shoulder, gentle fill, visible catchlights in the eyes. 85mm lens at f/2.8, sharp focus on the eyes. Neutral, slightly warm color grading. 4:5 aspect ratio with comfortable headroom. ${LIKENESS} No text, no watermark.`
    : `Fashion magazine cover featuring the person in the reference photos, upper-body shot, direct confident gaze into the camera. ${wear} ${place ? blend(bg) : `Plain ${bg} studio background.`} Dramatic single key light from the front left with a soft shadow on the opposite cheek, subtle hair light separating the subject from the background. 85mm lens at f/2.8, shallow depth of field. Editorial color grading, deep contrast. Layout: masthead across the top reading exactly ${JSON.stringify(title)}${cover_line ? `, one short cover line on the left side reading exactly ${JSON.stringify(cover_line)}` : ''}, clean sans-serif typography, generous margins, nothing overlapping the face. Vertical 3:4 aspect ratio. ${LIKENESS} No barcode, no additional text, no watermark.`
}

