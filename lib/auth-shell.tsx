export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="auth">
      <aside className="side">
        <a className="logo" href="/">Tendy<b>Lab</b> Tools</a>
        <h2>Mira qué mejorar antes de gastar más en publicidad</h2>
        <ul>
          <li>Diagnóstico de videos, creativos y hooks para tu producto</li>
          <li>Puntaje con evidencia y cambios ordenados por prioridad</li>
          <li>5 monedas de bienvenida, sin tarjeta</li>
        </ul>
      </aside>
      <main className="main">
        <a className="logo" href="/" style={{ marginBottom: 20 }}>Tendy<b>Lab</b> Tools</a>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  )
}
