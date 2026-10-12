import { AuthShell } from '@/lib/auth-shell'

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams
  return (
    <AuthShell title="Entra a tu cuenta">
      {e && <div className="err">{e === 'locked' ? 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.' : 'El email o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.'}</div>}
      <form className="form" method="post" action="/api/auth/login">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
        <button>Entrar</button>
      </form>
      <p>¿Aún no tienes cuenta? <a href="/register">Crea una gratis</a></p>
    </AuthShell>
  )
}
