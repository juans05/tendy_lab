'use client'
import { useState } from 'react'
import { cajon } from './cajon'

const S = (n: number) => `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const FIELDS = [['boxCost', '¿Cuánto cuesta el cajón? (S/)'], ['units', '¿Cuántos productos trae?'], ['price', '¿A cuánto vendes cada uno? (S/)'], ['perSale', 'Gasto por venta: envío, empaque, anuncios (S/, opcional)']] as const

export function CajonCalc() {
  const [v, set] = useState({ boxCost: '600', units: '40', price: '45', perSale: '6' })
  const r = cajon({ boxCost: +v.boxCost, units: +v.units, price: +v.price, perSale: +v.perSale || 0 })
  return <div className="cajon-calc">
    <div><span className="eyebrow">SIN REGISTRARTE</span><h2>¿Cuántas ventas te faltan para tu primer cajón?</h2>
      {FIELDS.map(([k, label]) => <div key={k}><label htmlFor={`cj-${k}`}>{label}</label><input id={`cj-${k}`} type="number" inputMode="decimal" min="0" step="any" value={v[k]} onChange={e => set(s => ({ ...s, [k]: e.target.value }))} /></div>)}</div>
    <div className="cajon-result" aria-live="polite"><small>Necesitas vender</small><b className="big">{r.salesNeeded ?? '—'}</b>
      <small>{!r.valid ? 'Completa costo, unidades y precio con números mayores a 0.' : r.salesNeeded ? 'productos para pagar tu cajón' : 'Con estos datos no recuperas el cajón. Sube el precio o baja tus gastos.'}</small>
      <dl><div><dt>Cada producto te cuesta</dt><dd>{r.valid ? S(r.unitCost) : '—'}</dd></div><div><dt>Ganas por cada venta</dt><dd>{r.valid ? S(r.profitPerSale) : '—'}</dd></div><div><dt>Si vendes todo el cajón ganas</dt><dd>{r.profitIfAllSold == null ? '—' : S(r.profitIfAllSold)}</dd></div></dl>
      <a className="btn" href="/register">Guárdalo y arma tu ruta →</a></div>
  </div>
}
