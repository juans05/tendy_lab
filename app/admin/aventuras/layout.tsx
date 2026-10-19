import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · Tendy Aventuras', robots: { index: false, follow: false } }

const TABS = [['', 'Resumen'], ['/historias', 'Historias'], ['/qr', 'Códigos QR'], ['/fotos', 'Fotos recibidas'], ['/ajustes', 'Ajustes']]

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <main className="wrap page">
    <p><a href="/admin">← Admin</a></p>
    <h1>Tendy Aventuras</h1>
    <nav className="av-tabs" aria-label="Secciones">{TABS.map(([p, l]) => <a key={p} href={`/admin/aventuras${p}`}>{l}</a>)}</nav>
    <style>{`.av-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 18px}.av-tabs a{padding:8px 14px;border-radius:10px;background:#fff;border:1px solid var(--line);font-weight:700;text-decoration:none;color:var(--navy)}
      .av-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0}.av-card h3{margin-top:0}.av-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .av-row > *{margin-top:0}.av-small{font-size:.85rem;color:var(--muted)}.av-badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:.8rem;font-weight:700;background:#eee}
      .av-badge.on{background:#e8f5e9;color:#1c5a22}.av-errs{background:#fde8e4;border-radius:10px;padding:10px 14px;color:#7a2216}.av-warns{background:#fff6d8;border-radius:10px;padding:10px 14px}`}</style>
    {children}
  </main>
}
