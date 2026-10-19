import { requireAdmin } from '@/lib/auth'
import { getSettings } from '@/lib/av-settings'

export default async function Ajustes({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requireAdmin()
  const { ok, e } = await searchParams
  const s = await getSettings()
  return <form className="form" method="post" action="/api/admin/aventuras/ajustes">
    {ok && <div className="ok">Ajustes guardados.</div>}
    {e && <div className="err">Revisa los valores (MB 1–20, fotos 1–3, días 30–1825, enlace válido).</div>}
    <label className="check"><input type="checkbox" name="uploads_enabled" defaultChecked={s.uploads_enabled} /> Subida de fotos activa</label>
    <div className="row">
      <div><label htmlFor="mb">MB máximos por foto</label><input id="mb" name="max_photo_mb" type="number" min={1} max={20} defaultValue={s.max_photo_mb} /></div>
      <div><label htmlFor="mx">Fotos máximas por kit</label><input id="mx" name="max_photos_per_kit" type="number" min={1} max={3} defaultValue={s.max_photos_per_kit} /></div>
      <div><label htmlFor="rd">Días de conservación</label><input id="rd" name="retention_days" type="number" min={30} max={1825} defaultValue={s.retention_days} /></div>
    </div>
    <p className="tag">Los días de conservación se aplican a las fotos que se suban desde ahora.</p>
    <div className="row">
      <div><label htmlFor="cv">Versión del consentimiento</label><input id="cv" name="consent_version" defaultValue={s.consent_version} maxLength={40} /></div>
      <div><label htmlFor="ku">Enlace «Ver nuevos kits»</label><input id="ku" name="kits_url" type="url" defaultValue={s.kits_url} /></div>
    </div>
    <p className="tag">Cambia la versión cuando actualices la política de privacidad: cada foto guarda la versión que aceptó el adulto.</p>
    <button>Guardar ajustes</button>
  </form>
}
