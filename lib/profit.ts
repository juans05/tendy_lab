// Economics Engine: determinista, en enteros de céntimos. La IA nunca toca estas cifras.
export const FORMULA_VERSION = 'profit-v1'

export type ProfitIn = {
  price: number; product_cost: number; ads_cost: number; packaging: number; delivery: number; other: number // céntimos
  fee_pct: number; tax_pct: number; target_margin_pct: number // porcentajes
}
const pct = (base: number, p: number) => Math.round((base * p) / 100)

// Precio en céntimos, redondeado hacia arriba para cubrir gastos y ganancia.
export function suggestedPrice(cost: number, gain: number, feePct: number, taxPct: number) {
  const rate = 1 - (feePct + taxPct) / 100
  if (rate <= 0) throw new Error('Los descuentos deben sumar menos de 100%.')
  let price = Math.ceil((cost + gain) / rate)
  // Cada porcentaje se redondea por separado; cubre hasta un céntimo de diferencia.
  while (price - pct(price, feePct) - pct(price, taxPct) < cost + gain) price++
  return price
}

function calc(i: ProfitIn) {
  const fee = pct(i.price, i.fee_pct), tax = pct(i.price, i.tax_pct)
  const nonAds = i.product_cost + i.packaging + i.delivery + i.other + fee + tax
  const total = nonAds + i.ads_cost
  const net = i.price - total
  const contribution = i.price - nonAds // = CAC máximo de equilibrio
  const targetCac = contribution - pct(i.price, i.target_margin_pct)
  return {
    total_cost: total, gross_profit: i.price - i.product_cost, net_profit: net,
    margin_pct: i.price > 0 ? Math.round((net / i.price) * 1000) / 10 : null,
    markup_pct: i.product_cost > 0 ? Math.round((net / i.product_cost) * 1000) / 10 : null,
    max_cac_breakeven: contribution,
    max_cac_target: targetCac >= 0 ? targetCac : null,
    breakeven_roas: contribution > 0 ? Math.round((i.price / contribution) * 100) / 100 : null, // null = NO_BREAKEVEN
    profit_10: net * 10, profit_50: net * 50, profit_100: net * 100,
  }
}

// ponytail: devoluciones/no recogidos y regímenes tributarios quedan para R2 (decisión D-10).
export function profit(i: ProfitIn) {
  const scen = (name: string, changed: string, v: ProfitIn) => ({ name, changed, ...calc(v) })
  return {
    formula_version: FORMULA_VERSION,
    inputs: i,
    ...calc(i),
    scenarios: [
      scen('Conservador', 'Publicidad por venta ×1.25', { ...i, ads_cost: Math.round(i.ads_cost * 1.25) }),
      scen('Base', 'Sin cambios', i),
      scen('Agresivo', 'Publicidad por venta ×0.80', { ...i, ads_cost: Math.round(i.ads_cost * 0.8) }),
    ],
  }
}
