'use client'

import { useState } from 'react'
import { fitCards } from './av-print-layout'

// Hoja de impresión: se marcan las tarjetas que se quieren y salen de 1, 2 o 4 por hoja (por defecto 2 en una A4).
// 1 = hoja A5, 2 = A4 horizontal, 4 = A4 vertical. Siempre con margen y separación para cortar, y una guía punteada.
export type PrintCard = { code: string; batch: string; title: string; tpl: string | null; qr: string; pos: { x: number; y: number; size: number } }
const LAYOUT = {
  1: { page: 'A5 portrait', w: 148, h: 210, cols: 1, rows: 1, label: '1 (A5)' },
  2: { page: 'A4 landscape', w: 297, h: 210, cols: 2, rows: 1, label: '2 (A4)' },
  4: { page: 'A4 portrait', w: 210, h: 297, cols: 2, rows: 2, label: '4 (A4)' },
} as const
type Per = keyof typeof LAYOUT

export function PrintSheet({ cards }: { cards: PrintCard[] }) {
  const [sel, setSel] = useState<Set<string>>(() => new Set(cards.map(c => c.code)))
  const [por, setPor] = useState<Per>(2)
  const L = LAYOUT[por]
  const F = fitCards(L, L.cols, L.rows)
  const chosen = cards.filter(c => sel.has(c.code))
  const sheets = Math.ceil(chosen.length / por)
  const pages = Array.from({ length: sheets }, (_, p) => chosen.slice(p * por, p * por + por))
  const toggle = (code: string) => setSel(s => { const n = new Set(s); n.has(code) ? n.delete(code) : n.add(code); return n })
  const card = (c: PrintCard, i: number) => c.tpl
    ? <><img className="tpl" src={c.tpl} alt={`Tarjeta ${c.title}`} />
        <img className="qr" src={c.qr} alt={`QR del kit ${i + 1}`} style={{ left: `${c.pos.x}%`, top: `${c.pos.y}%`, width: `${c.pos.size}%` }} /></>
    : <img className="solo" src={c.qr} alt={`QR del kit ${i + 1}`} />
  return <>
    <style>{`@page { size: ${L.page}; margin: 0 }
      @media print { html, body { background: #fff !important } main.page > :not(.ps-sheet) { display: none !important } main.page { padding: 0 !important; margin: 0 !important; max-width: none !important }
        .ps-pick { display: none !important } .ps-sheet { display: block !important }
        .ps-page { display: grid !important; width: ${L.w}mm; height: ${L.h}mm; box-sizing: border-box; padding: ${F.margin}mm !important; grid-template-columns: repeat(${L.cols}, ${F.cardW}mm) !important;
          grid-auto-rows: ${F.cardH}mm; gap: ${F.gap}mm !important; justify-content: center; align-content: center; break-after: page; border: 0 !important; background: none !important; margin: 0 !important; overflow: hidden }
        .ps-page:last-child { break-after: auto } .ps-card { width: ${F.cardW}mm !important; height: ${F.cardH}mm; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important;
          outline: .25mm dashed #9a9a9a !important; outline-offset: 1.5mm } .ps-card .qr { z-index: 1 }
        .ps-card .tpl { height: 100%; object-fit: fill } }
      .ps-bar { position: sticky; top: 0; z-index: 5; background: var(--cream); padding: 10px 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-bottom: 1px solid var(--line); margin-bottom: 14px }
      .ps-bar button { margin: 0 } .ps-count { font-weight: 800; color: var(--navy) }
      .ps-all { display: flex; flex-wrap: wrap; gap: 14px; } .ps-sheet { display: none }
      .ps-card { position: relative; width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 18px #0002; background: #fff }
      .ps-card .tpl { display: block; width: 100% } .ps-card .qr { position: absolute; height: auto; background: #fff } .ps-card .solo { display: block; width: 100% }
      .ps-pick { display: block; position: relative; cursor: pointer; margin: 0 } .ps-pick input { position: absolute; top: 8px; left: 8px; width: 26px; height: 26px; z-index: 2; accent-color: var(--orange) }
      .ps-pick.off .ps-card { opacity: .35; filter: grayscale(1) } .ps-pick.on .ps-card { outline: 4px solid var(--orange) }
      .ps-code { font-size: .8rem; color: var(--muted); text-align: center; margin-top: 4px }`}</style>
    <div className="ps-bar no-print">
      <button type="button" className="btn ghost" onClick={() => setSel(new Set(cards.map(c => c.code)))}>Todas</button>
      <button type="button" className="btn ghost" onClick={() => setSel(new Set())}>Ninguna</button>
      <span className="ps-count" role="status">{chosen.length} tarjeta{chosen.length === 1 ? '' : 's'} → {sheets} hoja{sheets === 1 ? '' : 's'}</span>
      <label className="av-row" style={{ margin: 0 }}>Por hoja:
        <select value={por} onChange={e => setPor(Number(e.target.value) as Per)} style={{ width: 'auto', margin: 0 }}>
          {([1, 2, 4] as Per[]).map(n => <option key={n} value={n}>{LAYOUT[n].label}</option>)}</select></label>
      <button type="button" disabled={!chosen.length} onClick={() => window.print()}>⬇ Descargar PDF / Imprimir</button>
    </div>
    <div className="ps-all no-print">{cards.map((c, i) => <label key={c.code} className={`ps-pick ${sel.has(c.code) ? 'on' : 'off'}`}>
      <input type="checkbox" checked={sel.has(c.code)} onChange={() => toggle(c.code)} aria-label={`Imprimir tarjeta ${i + 1}`} />
      <div className="ps-card">{card(c, i)}</div><div className="ps-code">{c.batch} · kit {cards.slice(0, i + 1).filter(x => x.batch === c.batch).length}</div>
    </label>)}</div>
    <div className="ps-sheet">{pages.map((pg, p) => <div className="ps-page" key={p}>
      {pg.map(c => <div className="ps-card" key={c.code}>{card(c, cards.indexOf(c))}</div>)}</div>)}</div>
  </>
}
