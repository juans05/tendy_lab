'use client'

import { usePathname } from 'next/navigation'

export function PanelNav({ admin }: { admin: boolean }) {
  const path = usePathname()
  return <nav aria-label="Navegación de la miniApp">
    {[
      ['/panel/products', 'Mi ruta ecommerce', '↗'],
      ['/panel/semana', 'Mi semana', '▦'],
      ['/panel/orders', 'Mis pedidos', '▤'],
      ['/panel', 'Herramientas', '◫'],
      ['/panel/history', 'Mis análisis', '◷'],
      ['/panel/brand', 'Mi marca', '◇'],
      ...(admin ? [['/admin', 'Administración', '⚙']] : []),
    ].map(([href, label, icon]) => {
      const active = href === '/panel' ? path === href || path.startsWith('/panel/tools/') : path.startsWith(href)
      return <a key={href} href={href} aria-current={active ? 'page' : undefined}><span aria-hidden="true">{icon}</span>{label}{active && <i aria-hidden="true" />}</a>
    })}
  </nav>
}
