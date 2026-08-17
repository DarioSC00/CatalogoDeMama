import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    }

    initializeSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-sm font-medium text-slate-500">
        Verificando acceso...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
