# Cómo crear un personaje y una aventura nueva

Guía para el equipo de TendyPeru. No hace falta tocar código.

## 1. Prepara los videos

- Un video por capítulo. Recomendado: **menos de 60 segundos**, 720p, MP4.
- Los capítulos con decisiones terminan con la pregunta (por ejemplo: «¿Entramos al bosque o a la casa encantada?»).
  Los botones con las opciones aparecen cuando termina el video.
- Tono: misterio divertido, sin sustos intensos ni violencia.
- Opcional: una imagen por capítulo (se ve antes de dar play).

## 2. Crea la aventura

1. Entra a `/admin/aventuras/historias`.
2. En **Nueva aventura** escribe el título. La dirección (slug) se genera sola, por ejemplo
   `renito-y-la-estrella-perdida` → `tendyperu.com/aventuras/renito-y-la-estrella-perdida`.
3. Elige la colección y el personaje, o escribe uno nuevo en «…o nueva colección» / «…o nuevo personaje».
4. Pulsa **Crear y agregar capítulos**.

## 3. Agrega los capítulos

- Pulsa **+ Agregar capítulo** las veces que quieras. Solo son obligatorios el **título** y el **video**.
- El primer capítulo de la lista es el inicio. Usa **↑ Subir / ↓ Bajar** para ordenarlos.
- Sin decisiones, la historia avanza en el orden de la lista y el último capítulo lleva a la misión de pintura.
- En **Opcional** de cada capítulo:
  - **Descripción:** se muestra como texto bajo el video (ayuda a quien no puede escuchar).
  - **Decisiones:** 2 o 3 opciones; cada una lleva a un capítulo.
  - **Capítulo siguiente:** salta a otro capítulo sin preguntar (para cerrar una rama y unir caminos).
  - **Es un final:** después de este capítulo va la misión.
- En **Datos generales → Misión de pintura** escribe el texto y los consejos.
- Pulsa **Guardar** cuando quieras.

## 4. Valida y publica

- Pulsa **Validar y publicar**. Si algo falta (un capítulo sin video, una decisión con una sola opción, un camino que
  da vueltas sin terminar), verás qué capítulo revisar y la aventura no se publica.
- **Vista previa ↗** muestra la aventura como la verá el niño, incluso sin publicar.
- Si editas una aventura publicada y queda con errores, se despublica sola para que ningún niño se quede atascado.

## 5. Genera los QR de los kits

1. Entra a `/admin/aventuras/qr`.
2. Elige la aventura, ponle nombre al lote (por ejemplo `navidad-dic-2026`) y la cantidad de kits.
3. Pulsa **Imprimir / descargar**, luego Ctrl+P → «Guardar como PDF» para la imprenta.
4. **Coloca el QR dentro del empaque**, no a la vista en tienda: el código de cada kit es la llave de sus fotos.
5. Para redes o el empaque exterior usa el **QR general** de la aventura: abre el cuento pero no permite subir fotos.
6. Si quieres que un lote ya impreso abra otra historia, usa **Reasignar**: los QR no cambian.

## 6. Atención a familias

- **«Olvidé mi PIN»:** confirma por WhatsApp que es el comprador (foto del QR del kit o número de pedido). Luego, en
  `/admin/aventuras/qr` → **Resetear PIN**, escribe el código del kit (`TP-…`, aparece al abrir el QR o en el lote) y
  envíale el PIN temporal. Se muestra una sola vez.
- **Fotos recibidas:** en `/admin/aventuras/fotos` solo puedes aprobar para galería las fotos con permiso de galería
  vigente. Aprueba solo si se ve la figura, sin rostros ni datos del niño.
- **Pausar subidas:** `/admin/aventuras/ajustes` → desmarca «Subida de fotos activa».
