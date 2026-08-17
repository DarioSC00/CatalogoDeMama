import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import { supabase } from '../../supabaseClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Completa el correo y la contraseña.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        throw error
      }

      const redirectPath = location.state?.from || '/admin/products'
      navigate(redirectPath, { replace: true })
      toast.success('Sesion iniciada correctamente.')
    } catch (error) {
      toast.error(error.message || 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[30px] border border-rose-100 bg-white p-7 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg shadow-rose-200">
            <Icon icon="mdi:shield-account" className="text-3xl" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-500">Administración</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Iniciar sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-rose-400 focus:bg-white"
              placeholder="admin@tuapp.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-rose-400 focus:bg-white"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon icon={loading ? 'mdi:loading' : 'mdi:login'} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Ingresando...' : 'Entrar al panel'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center text-xs text-rose-700">
          Solo el administrador puede gestionar productos y categorías.
        </div>
      </div>
    </div>
  )
}
