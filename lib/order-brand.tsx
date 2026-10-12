export function OrderBrand({ name, src }: { name: string; src?: string }) {
  return <div className="order-brand">{src ? <img src={src} alt={`Logo de ${name}`} width="180" height="64" /> : <span className="logo tendy-order-logo"><span className="brand-mark" aria-hidden="true">t.</span>Tendy<b>Lab</b></span>}<span className="order-brand-name">{name}</span></div>
}
