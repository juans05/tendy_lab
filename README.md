# TendyLab Tools (MVP de 3 días)

Una sola app Next.js + **PostgreSQL para todo**: usuarios, sesiones, cola de jobs (`runs` con `FOR UPDATE SKIP LOCKED`),
ledger de créditos y archivos (`bytea`). Sin Redis, sin Supabase, sin storage externo.

IA: cadena de respaldo **Gemini → Claude → Groq** (`lib/ai.ts`; entran los que tengan clave, orden en `AI_PROVIDERS`).
Gemini analiza el video con 12 frames + audio; Claude y Groq reciben solo los frames (sin audio).

Miniapps: Analiza mi Video, Hooks desde Producto, Analiza mi Creativo, Profit Calculator (sin IA).

## Local

```bash
npm install
npm run db            # opcional: Postgres local embebido; si no, usa DB_* / DATABASE_URL
cp .env.example .env  # y pon GEMINI_API_KEY y la BD (DB_*)
npm test              # fórmulas y scoring
npm run dev
```

Requiere `ffmpeg` y `ffprobe` en el PATH (o `FFMPEG_PATH`). Para ser admin (ve `/admin`): regístrate y luego en la BD `update users set is_admin = true where email = 'tu@correo';`. Por seguridad nadie es admin solo por registrarse.

## Railway

1. Nuevo proyecto → **PostgreSQL** + servicio desde este repo (usa el `Dockerfile`, que instala ffmpeg).
2. Variables del servicio: `DATABASE_URL` (referencia al Postgres de Railway, URL interna), `GEMINI_API_KEY`,
   `GEMINI_MODEL` (opcional).
3. Las tablas se crean solas al arrancar (`instrumentation.ts`). Un solo proceso hace web y worker.

## Qué NO está (a propósito, por el plazo)

| Falta | Cuándo |
|---|---|
| Cobros (Culqi), planes, comprobantes SUNAT | El admin asigna créditos a mano en `/admin` (ledger `ADMIN_ADJUST`) |
| Verificación de email, límites por IP/dispositivo | Antes de abrir el plan Free al público |
| Reel/Guion, Campaña desde Foto, Ads Doctor | R1/R2 del plan |
| Archivos en R2/S3 | Cuando el volumen de `bytea` incomode (video limitado a 100 MB) |
| Términos, privacidad, consentimiento (Ley 29733) | Antes de lanzar |
| Equipos/roles, exportar/compartir, notificaciones por email | Post-MVP |

Cada simplificación está marcada en el código con `ponytail:`.

## Tendy Aventuras (`/aventuras`)

Cuentos interactivos en video para los kits de yeso de TendyPeru. Cada kit trae un QR con un código único
(`https://tendyperu.com/k/TP-XXXXXXXX`); al escanearlo se abre la aventura: capítulos en video con decisiones,
misión de pintura, diploma (se dibuja en el celular, el nombre no se guarda) y, solo para el adulto, hasta 3 fotos
privadas protegidas con un PIN de 4 dígitos.

- **Público:** `/k/<código>` (QR del kit) → `/aventuras/<slug>`, `/aventuras/mis-fotos?k=<código>`, `/aventuras/privacidad`.
- **Admin:** `/admin/aventuras` (resumen, historias y capítulos, códigos QR, fotos recibidas, ajustes). Requiere `is_admin`.
- **Guía para crear personajes y aventuras:** [`docs/aventuras-nuevos-personajes.md`](docs/aventuras-nuevos-personajes.md).

### Variables de entorno

| Variable | Para qué |
|---|---|
| `PUBLIC_BASE_URL` | Dominio que va dentro de los QR (`https://tendyperu.com`). |
| `MEDIA_ENC_KEY` | Clave AES-256 (32 bytes en base64) que cifra las fotos. Generar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Sin ella la subida responde 503 y el resto funciona. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Videos e imágenes de los capítulos (contenido de TendyPeru). El admin sube directo a Cloudinary con firma del servidor. |

> **Importante:** si se pierde `MEDIA_ENC_KEY`, las fotos guardadas no se pueden recuperar nunca. Guárdala en las
> variables de Railway **y** en un respaldo offline (gestor de contraseñas). No la cambies con fotos guardadas.

### Privacidad (resumen técnico)

- Las fotos de niños **nunca** van a Cloudinary: se re-codifican con sharp (WebP, sin EXIF/GPS, máx. 2000 px) y se
  guardan cifradas (AES-256-GCM) en `media_files`. Solo se descifran para la sesión de su kit (código + PIN, cookie de
  30 min) o para un admin. Cualquier otro acceso da 404.
- Consentimientos por foto (`store` obligatorio, `gallery` y `ads` opcionales, sin premarcar) con versión y fecha;
  se retiran desde «Mis fotos». Retención configurable; el worker borra lo vencido cada minuto.
- PIN: 5 fallos → bloqueo de 15 min; 20 → hasta que el admin genere un PIN temporal (se muestra una sola vez).
- Sin datos del niño ni del adulto; las estadísticas (`adventure_events`) no guardan IP.
- `/k/`, `/aventuras/mis-fotos`, `/admin` y `/api` están fuera de los buscadores (`app/robots.ts` + `noindex`).
- **Antes de lanzar:** revisión legal de `/aventuras/privacidad` (Ley 29733 y su reglamento) y registro del banco de
  datos ante la ANPD si corresponde.

### Despliegue (Railway)

1. Agregar al servicio `PUBLIC_BASE_URL=https://tendyperu.com`, `MEDIA_ENC_KEY` y las tres `CLOUDINARY_*`.
2. Desplegar: las tablas nuevas y la aventura semilla «Fantasmín» (sin publicar, sin capítulos) se crean solas al arrancar.
3. En `/admin/aventuras/historias` agregar los capítulos con sus videos, validar y publicar.
4. En `/admin/aventuras/qr` generar el lote, imprimir (Ctrl+P → PDF) y colocar el QR **dentro** del empaque.

### Desarrollo y pruebas

```bash
npm test                                   # lógica pura (códigos, cifrado, historias, imágenes, PIN, Cloudinary)
# Pruebas con BD (solo contra una BD local, nunca la del .env):
TEST_DB=1 DATABASE_URL=postgres://tendy:tendy@127.0.0.1:5433/tendy_av npm test
# Datos de prueba locales (capítulos + un código de kit):
DATABASE_URL=postgres://...@127.0.0.1:5433/tendy_av npx tsx scripts/av-demo.ts <public_id_de_video>
```

La BD local debe ser UTF-8 (los títulos llevan emojis): `create database tendy_av encoding 'UTF8' template template0`.

| Fase 2 (no incluido) | |
|---|---|
| Videos subidos por el adulto | Requieren almacenamiento privado tipo R2 (cifrado) |
| Galería pública moderada, álbum compartible por enlace | La moderación y el permiso `gallery` ya existen |
| Música/efectos aparte, plantillas de diploma editables, estadísticas completas | |
