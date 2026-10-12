'use client'
import { useState } from 'react'

const extras = [
  ['packaging', 'Empaque', 'Costo de la bolsa, caja o envoltura de un producto.'],
  ['delivery', 'Motorizado', 'Lo que pagas tú al motorizado por entregar un producto. Si el cliente paga todo el envío aparte, no lo agregues.'],
  ['ads_cost', 'Publicidad por venta', 'Cuánto estimas gastar en anuncios para conseguir una venta.'],
  ['other', 'Otro gasto por producto', 'Por ejemplo, transporte o preparación.'],
  ['fee_pct', 'Descuento por cobrar con tarjeta (%)', 'Si te cobran 3 de cada 100, escribe 3.'],
  ['tax_pct', 'Impuestos que pagas por venta (%)', 'Si aplica, escribe el porcentaje sobre tu precio de venta.'],
] as const

export function ProfitFields() {
  const [added, setAdded] = useState<string[]>([])
  const [choice, setChoice] = useState<string>(extras[0][0])
  const remaining = extras.filter(([key]) => !added.includes(key))
  return <>
    <input type="hidden" name="mode" value="suggest" />
    <div className="row profit-basic"><div><label htmlFor="product_cost">¿Cuánto te cuesta un producto?</label><input id="product_cost" name="product_cost" type="number" min="0.01" max="1000000000" step="0.01" placeholder="Ej. 20.00" required /><p className="tag">El precio que pagas a tu proveedor por una unidad.</p></div><div><label htmlFor="desired_gain">¿Cuánto quieres ganar por producto?</label><input id="desired_gain" name="desired_gain" type="number" min="0" max="1000000000" step="0.01" placeholder="Ej. 15.00" required /><p className="tag">El dinero que quieres que te quede después de todos los gastos.</p></div></div>
    <div className="profit-extras"><h3>¿Tienes otros gastos?</h3><p className="tag">Agrega solo los que pagas tú. Todos los montos son por un producto.</p>
      {extras.map(([key, label, help]) => added.includes(key) ? <div className="extra-cost" key={key}><div><label htmlFor={key}>{label}</label><p className="tag">{help}</p></div><input id={key} name={key} type="number" min="0" max={key.endsWith('pct') ? '99.99' : '1000000000'} step="0.01" defaultValue="0" aria-label={label} required /><button type="button" className="link" aria-label={`Quitar ${label}`} onClick={() => { setAdded(added.filter(k => k !== key)); setChoice(key) }}>Quitar</button></div> : <input key={key} type="hidden" name={key} value="0" />)}
      {remaining.length > 0 && <div className="add-cost"><label className="sr-only" htmlFor="cost-choice">Tipo de gasto a agregar</label><select id="cost-choice" value={remaining.some(([k]) => k === choice) ? choice : remaining[0][0]} onChange={e => setChoice(e.target.value)}>{remaining.map(([k, label]) => <option value={k} key={k}>{label}</option>)}</select><button type="button" className="btn ghost" onClick={() => { const key = remaining.some(([k]) => k === choice) ? choice : remaining[0][0]; setAdded([...added, key]); setChoice(remaining.find(([k]) => k !== key)?.[0] || '') }}>+ Agregar gasto</button></div>}
    </div><p className="note">Ejemplo: si te cuesta 20 y quieres ganar 15, sin otros gastos tu precio sería 35.</p>
  </>
}
