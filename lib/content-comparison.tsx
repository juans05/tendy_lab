'use client'

import { useState } from 'react'

export function ContentComparison() {
  const [improved, setImproved] = useState(true)
  return <div className={`content-comparison ${improved ? 'is-improved' : 'is-basic'}`}>
    <div className="comparison-toolbar">
      <span>UN PRODUCTO. DOS FORMAS DE CONTARLO.</span>
      <div className="comparison-options" role="group" aria-label="Comparar publicación">
        <button type="button" aria-pressed={!improved} onClick={() => setImproved(false)}>Antes</button>
        <button type="button" aria-pressed={improved} onClick={() => setImproved(true)}>Con estrategia + IA</button>
      </div>
    </div>
    <div className="comparison-board" aria-live="polite">
      <div className="strategy-note"><span className="note-arrow" aria-hidden="true">↘</span><span className="eyebrow">{improved ? '01 / UNA IDEA CLARA' : '01 / EL MENSAJE'}</span><h3>{improved ? 'Primero, una razón para mirar.' : 'El producto está. La idea falta.'}</h3><p>{improved ? 'Elegimos un ángulo concreto: darle color a una pausa cotidiana. La IA nos ayuda a explorar cómo mostrarlo.' : '“Vendo termo” dice qué ofreces, pero no construye una escena ni ayuda a imaginar el producto en la rutina.'}</p></div>
      <figure className="example-post">
        <figcaption><span className="sample-avatar">t.</span><b>Tu marca</b><span>Ejemplo de publicación</span></figcaption>
        <div className="post-art"><img src="/images/product-studio.webp" alt="Termo naranja sobre un pedestal, usado como ejemplo de publicación" width="900" height="1350" loading="lazy" />{improved && <div className="post-headline">Tu pausa.<br />Tu color.<span>Hazla tuya.</span></div>}</div>
        <div className="post-caption"><b>{improved ? 'Un poco de color para tu rutina. 🍊' : 'Vendo termo naranja.'}</b><p>{improved ? 'Para el escritorio, tus planes y esa pausa que te mereces. Escríbenos “COLOR” y consulta los modelos disponibles.' : 'Más información por inbox.'}</p></div>
      </figure>
      <div className="strategy-note second-note"><span className="eyebrow">{improved ? '02 / UN SIGUIENTE PASO' : '02 / LA CONVERSACIÓN'}</span><h3>{improved ? 'Después, abre la conversación.' : '¿Qué debe hacer el cliente?'}</h3><p>{improved ? 'El texto conecta la imagen con una situación y termina con una acción sencilla. Revisamos los datos antes de publicar.' : 'Una invitación genérica deja todo el trabajo al visitante. Podemos darle un motivo y una forma clara de escribir.'}</p><span className="hand-note">{improved ? 'La intención la ponemos nosotros. La IA ayuda a crear.' : 'Una buena foto es solo el comienzo.'}</span></div>
    </div>
    <p className="comparison-disclaimer">Demostración ilustrativa de mensaje y composición. Se usa la misma fotografía para comparar; no representa una prueba de ventas.</p>
  </div>
}
