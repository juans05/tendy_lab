// Meta del emprendedor: cuántas ventas pagan su primer cajón. Determinista, sin IA.
const r2 = (n: number) => Math.round(n * 100) / 100
const ok = (n: number) => Number.isFinite(n) && n > 0
export function cajon({ boxCost, units, price, perSale = 0 }: { boxCost: number; units: number; price: number; perSale?: number }) {
  const valid = ok(boxCost) && ok(units) && ok(price) && Number.isFinite(perSale) && perSale >= 0
  const unitCost = valid ? r2(boxCost / units) : 0
  const profitPerSale = valid ? r2(price - unitCost - perSale) : 0
  const recovers = valid && profitPerSale > 0
  return {
    valid, unitCost, profitPerSale,
    salesNeeded: recovers ? Math.ceil(boxCost / profitPerSale) : null,
    profitIfAllSold: recovers ? r2(profitPerSale * Math.floor(units)) : null,
  }
}
