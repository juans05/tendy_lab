'use client'
import { useState } from 'react'
import { NEEDS, PARTS } from './course'

// El visitante elige dónde está y ve qué partes del curso y qué herramientas le sirven primero.
export function CoursePicker({ toolNames }: { toolNames: Record<string, string> }) {
  const [pick, setPick] = useState<number | null>(null)
  const need = pick === null ? null : NEEDS[pick]
  return <div className={`course-picker${need ? ' has-pick' : ''}`}>
    <p className="picker-q" id="picker-q">¿En qué parte estás?</p>
    <div className="picker-options" role="group" aria-labelledby="picker-q">
      {NEEDS.map((n, i) => <button key={n.label} type="button" className="picker-chip" aria-pressed={pick === i} onClick={() => setPick(pick === i ? null : i)}>{n.label}</button>)}
    </div>
    <ol className="parts">{PARTS.map((p, i) => <li key={p} className={need ? (need.parts.includes(i) ? 'is-match' : 'is-dim') : ''}><b>{String(i + 1).padStart(2, '0')}</b>{p}</li>)}</ol>
    <div className="picker-result" aria-live="polite">{need && <div key={pick}>
      <p>Empieza por <strong>{need.parts.map(i => PARTS[i]).join(', ')}</strong>. En la plataforma te ayuda: {need.tools.map(t => toolNames[t]).join(', ')}.</p>
    </div>}</div>
  </div>
}
