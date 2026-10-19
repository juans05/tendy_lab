import { getSettings } from '@/lib/av-settings'
import '../aventuras.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Privacidad · Tendy Aventuras' }

// ponytail: borrador; debe revisarlo un abogado (Ley 29733 y su reglamento) antes del lanzamiento.
export default async function Privacidad() {
  const s = await getSettings()
  return <main className="av av-doc">
    <h1>Privacidad en Tendy Aventuras</h1>
    <p className="av-meta">Versión {s.consent_version} · Borrador pendiente de revisión legal</p>
    <h2>El cuento no pide datos</h2>
    <p>Escuchar la historia, hacer la misión y descargar el diploma no requiere registro. No pedimos el nombre del niño, su colegio, su dirección ni su ubicación. El nombre que se escribe en el diploma se usa solo en el celular y no se envía a nuestros servidores.</p>
    <h2>Fotos de la creación (solo adultos)</h2>
    <p>El padre, madre o tutor puede guardar hasta {s.max_photos_per_kit} fotos de la figura pintada usando el QR de su kit y un PIN de 4 dígitos. Las fotos se guardan cifradas, sin metadatos de ubicación, y solo se ven con el QR del kit y el PIN. Nunca se publican automáticamente.</p>
    <h2>Permisos separados</h2>
    <ul>
      <li><b>Guardar en privado</b> (obligatorio para subir): guardamos la foto para que la vean ustedes.</li>
      <li><b>Galería de manualidades</b> (opcional): podríamos mostrar la figura terminada, sin rostros ni datos del niño, después de revisarla.</li>
      <li><b>Publicidad</b> (opcional): podríamos usar la foto en comunicaciones de TendyPeru.</li>
    </ul>
    <p>Cada permiso se registra con su fecha y versión, y se puede retirar en cualquier momento desde «Ver mis fotos».</p>
    <h2>Cuánto tiempo y cómo borrar</h2>
    <p>Las fotos se borran automáticamente a los {s.retention_days} días. Puedes borrar una foto o todas cuando quieras desde «Ver mis fotos». Las copias de seguridad del servidor se renuevan periódicamente.</p>
    <h2>Estadísticas</h2>
    <p>Contamos de forma anónima escaneos, aventuras iniciadas y completadas, sin guardar direcciones IP ni datos del dispositivo.</p>
    <h2>Contacto</h2>
    <p>¿Olvidaste tu PIN o quieres ejercer tus derechos? Escríbenos por <a href="https://wa.me/51907579197">WhatsApp</a>.</p>
  </main>
}
