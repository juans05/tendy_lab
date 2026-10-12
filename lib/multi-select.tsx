'use client'
import { useEffect, useRef, useState } from 'react'
import type { Opt } from './brand-options'

// Lista desplegable con casillas: cada opción marcada se envía con el formulario (mismo `name`).
// `single` usa botones de opción (una sola). `${name}_extra` recibe valores propios separados por coma.
export function MultiSelect({ name, label, options, defaults, single = false, placeholder, extraHint }: {
  name: string; label: string; options: Opt[]; defaults: string[]; single?: boolean; placeholder: string; extraHint?: string
}) {
  const known = new Set(options.map(o => o.value))
  const [sel, setSel] = useState<string[]>(defaults.filter(d => known.has(d)))
  const [extra, setExtra] = useState(defaults.filter(d => !known.has(d)).join(', '))
  const [q, setQ] = useState('')
  const box = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) box.current.open = false }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && box.current) box.current.open = false }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [])

  const toggle = (v: string) => setSel(s => (single ? [v] : s.includes(v) ? s.filter(x => x !== v) : [...s, v]))
  const labelOf = (v: string) => options.find(o => o.value === v)?.label ?? v
  const extras = extra.split(',').map(x => x.trim()).filter(Boolean)
  const shown = options.filter(o => o.label.toLowerCase().includes(q.trim().toLowerCase()))
  const total = sel.length + extras.length

  return (
    <div className="ms-field">
      <label id={`${name}-l`}>{label}</label>
      <details className="ms" ref={box}>
        <summary aria-labelledby={`${name}-l`}>
          {total === 0 ? <span className="ms-ph">{placeholder}</span> : (
            <span className="ms-chips">
              {[...sel.map(labelOf), ...extras].slice(0, single ? 1 : 4).map(t => <span className="ms-chip" key={t}>{t}</span>)}
              {total > (single ? 1 : 4) && <span className="ms-chip more">+{total - 4}</span>}
            </span>
          )}
        </summary>
        <div className="ms-panel">
          {options.length > 8 && <input type="search" className="ms-search" placeholder="Buscar" value={q} onChange={e => setQ(e.target.value)} aria-label={`Buscar en ${label}`} />}
          <div className="ms-list" role="group" aria-labelledby={`${name}-l`}>
            {shown.map(o => (
              <label className="ms-opt" key={o.value}>
                <input type={single ? 'radio' : 'checkbox'} name={name} value={o.value} checked={sel.includes(o.value)} onChange={() => toggle(o.value)} />
                {o.label}
              </label>
            ))}
            {shown.length === 0 && <p className="tag" style={{ padding: 8 }}>Sin resultados. Puedes escribirlo abajo.</p>}
          </div>
          {!single && sel.length > 0 && <button type="button" className="link" onClick={() => setSel([])}>Quitar selección</button>}
          <input name={`${name}_extra`} className="ms-extra" placeholder={extraHint ?? 'Otro: escríbelo y sepáralos con coma'} value={extra} onChange={e => setExtra(e.target.value)} maxLength={200} />
        </div>
      </details>
    </div>
  )
}
