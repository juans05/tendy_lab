import { AuthShell } from '@/lib/auth-shell'

export default async function Register({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams
  return (
    <AuthShell title="Crea tu cuenta gratis">
      <p>Recibe acceso a tus herramientas para preparar contenido para redes, con herramientas gratuitas y 5 monedas de bienvenida para probar las funciones que usan monedas.</p>
      {e === 'exists' && <div className="err">Ese email ya tiene una cuenta. <a href="/login">Entra aquí</a>.</div>}
      {e === 'invalid' && <div className="err">Revisa el email y usa una contraseña de al menos 8 caracteres.</div>}
      <form className="form" method="post" action="/api/auth/register">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
        <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <button>Crear cuenta y recibir 5 monedas</button>
      </form>
      <p className="tag">Tus archivos son privados y se eliminan a los 30 días. No los usamos para entrenar modelos propios.</p>
      <p>¿Ya tienes cuenta? <a href="/login">Entrar</a></p>
    </AuthShell>
  )
}
