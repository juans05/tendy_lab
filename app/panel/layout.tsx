import { requireUser } from '@/lib/auth'
import { balance, fmt } from '@/lib/credits'
import { PanelNav } from '@/lib/panel-nav'

export const dynamic = 'force-dynamic'

export default async function Panel({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const b = await balance(user.id)
  return (
    <div className="miniapp">
      <aside className="app-sidebar">
        <a className="logo" href="/panel"><span className="brand-mark" aria-hidden="true">t.</span>Tendy<b>Lab</b></a>
        <span className="workspace-label">TU ESPACIO CREATIVO</span>
        <PanelNav admin={user.is_admin} />
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span aria-hidden="true">✦</span><b>Tu marca, tu voz.</b><p>Personaliza los análisis con el estilo de tu negocio.</p><a href="/panel/brand">Configurar mi marca ↗</a></div>
          <a className="back-home" href="/">← Volver a la web</a>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="app-topbar"><span>TendyLab <span className="topbar-divider">/</span> <b>MiniApp</b></span><div><a className="app-credit" href="/panel/buy"><span aria-hidden="true">✦</span> {fmt(b)} monedas · Comprar</a><span className="user-avatar" aria-label="Tu cuenta">{(user.brand.name || user.email).slice(0, 1).toUpperCase()}</span><form method="post" action="/api/auth/logout"><button className="link">Salir</button></form></div></header>
        <main className="wrap page">{children}</main>
        <footer className="app-footer">Un siguiente paso más claro, para cada idea.</footer>
      </div>
    </div>
  )
}
