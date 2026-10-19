import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Tendy Aventuras', robots: { index: false, follow: false } }

const TABS = [['', 'Resumen'], ['/historias', 'Historias'], ['/qr', 'Códigos QR'], ['/fotos', 'Fotos recibidas'], ['/ajustes', 'Ajustes']]

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <main className="wrap page">
    <p><a className="av-back" href="/admin">← Admin</a></p>
    <h1>Tendy Aventuras</h1>
    <nav className="av-tabs" aria-label="Secciones">{TABS.map(([p, l]) => <a key={p} href={`/admin/aventuras${p}`}>{l}</a>)}</nav>
    <style>{`.av-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 18px}.av-tabs a{padding:8px 14px;border-radius:10px;background:#fff;border:1px solid var(--line);font-weight:700;text-decoration:none;color:var(--navy)}
      .av-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0}.av-card h3{margin-top:0}.av-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .av-row > *{margin-top:0}.av-small{font-size:.85rem;color:var(--muted)}.av-badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:.8rem;font-weight:700;background:#eee}
      .av-badge.on{background:#e8f5e9;color:#1c5a22}.av-errs{background:#fde8e4;border-radius:10px;padding:10px 14px;color:#7a2216}.av-warns{background:#fff6d8;border-radius:10px;padding:10px 14px}
      main.wrap.page{padding-left:16px;padding-right:16px}.av-back{display:inline-flex;align-items:center;min-height:40px}
      .av-tabs{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.av-tabs a{white-space:nowrap;min-height:44px;display:inline-flex;align-items:center}
      .av-btnlink{display:inline-flex;align-items:center;min-height:40px;padding:6px 14px;border:1px solid var(--line);border-radius:10px;background:#fff;font-weight:700;text-decoration:none;color:var(--navy);margin:2px}
      .av-card h3 a{display:block;padding:9px 0}.av-glist{list-style:none;padding:0;display:grid;gap:8px}
      .av-glist li{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px 12px}
      @media(max-width:700px){h1{font-size:1.6rem}.av-table thead{display:none}.av-table,.av-table tbody{display:block}
        .av-table tr{display:block;border-bottom:8px solid var(--cream);background:#fff;padding:6px 0}
        .av-table td{display:flex;justify-content:space-between;gap:12px;border:0;padding:5px 14px;background:transparent}
        .av-table td::before{content:attr(data-label);font-weight:700;color:var(--navy)}
        main.page form button{width:100%}}`}</style>
    {children}
  </main>
}
