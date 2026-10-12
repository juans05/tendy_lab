import { requireUser } from '@/lib/auth'
import { BRAND_FIELDS } from '@/lib/brand-options'
import { MultiSelect } from '@/lib/multi-select'

const SELECTS: [keyof typeof BRAND_FIELDS, string, string][] = [
  ['country', 'País o países donde vendes', 'Elige uno o varios'],
  ['currency', 'Moneda de tus precios', 'Elige una moneda'],
  ['category', 'Categoría de tu negocio', 'Elige una o varias'],
  ['audience', 'Público al que le vendes', 'Elige uno o varios'],
  ['tone', 'Tono de tu marca', 'Elige uno o varios'],
  ['avoid', 'Palabras o promesas a evitar', 'Elige las que no quieres usar'],
  ['channels', 'Canales donde publicas', 'Elige uno o varios'],
]

export default async function Brand({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser()
  const { ok } = await searchParams
  const list = (k: string) => (user.brand[k] ?? '').split(',').map(x => x.trim()).filter(Boolean)
  return (
    <>
      <span className="eyebrow">EL CONTEXTO QUE HACE LA DIFERENCIA</span>
      <h1>Tu marca tiene su propia voz.</h1>
      <p className="muted">Se configura una vez y personaliza todas las herramientas. Puedes desactivarlo en cada análisis.</p>
      {ok && <div className="ok">Guardado.</div>}
      <form className="form" method="post" action="/api/brand">
        <div className="form-heading"><span className="form-step" aria-hidden="true">◇</span><div><h2>Perfil de marca</h2><p>Cuéntanos quién eres y a quién quieres llegar.</p></div></div>
        <label htmlFor="name">Nombre comercial</label>
        <input id="name" name="name" placeholder="Ej. TendyPerú" defaultValue={user.brand.name ?? ''} maxLength={100} />
        <div className="row" style={{ marginTop: 4 }}>
          {SELECTS.map(([k, label, ph]) => (
            <MultiSelect key={k} name={k} label={label} placeholder={ph} options={[...BRAND_FIELDS[k].options]} single={BRAND_FIELDS[k].single} defaults={list(k)}
              extraHint={k === 'currency' ? 'Otra moneda: escribe el código' : undefined} />
          ))}
        </div>
        <label htmlFor="palette">Colores de mi marca</label><input id="palette" name="palette" maxLength={250} defaultValue={user.brand.palette || ''} placeholder="Azul marino y crema, o códigos como #18334D" /><label htmlFor="typography">Tipografía de mi marca</label><input id="typography" name="typography" maxLength={250} defaultValue={user.brand.typography || ''} placeholder="Ej.: letras sin serif, claras y modernas" /><button>Guardar mi marca <span aria-hidden="true">✓</span></button>
      </form>
    </>
  )
}
