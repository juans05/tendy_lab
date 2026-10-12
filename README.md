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
cp .env.example .env  # y pon GEMINI_API_KEY, ADMIN_EMAIL y la BD (DB_*)
npm test              # fórmulas y scoring
npm run dev
```

Requiere `ffmpeg` y `ffprobe` en el PATH (o `FFMPEG_PATH`). El primer usuario que se registre con `ADMIN_EMAIL` es admin y ve `/admin`.

## Railway

1. Nuevo proyecto → **PostgreSQL** + servicio desde este repo (usa el `Dockerfile`, que instala ffmpeg).
2. Variables del servicio: `DATABASE_URL` (referencia al Postgres de Railway, URL interna), `GEMINI_API_KEY`,
   `GEMINI_MODEL` (opcional), `ADMIN_EMAIL`.
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
