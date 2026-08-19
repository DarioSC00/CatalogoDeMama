import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppRoutes from './routes/AppRoutes'
import { supabase } from './supabaseClient'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
  { to: '/admin/categories', label: 'Categorías', icon: 'mdi:tag-outline' },
  { to: '/admin/products', label: 'Productos', icon: 'mdi:package-variant-closed' },
]

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('catalog-theme') || 'light')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('catalog-theme', theme)
  }, [theme])

  useEffect(() => {
    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setSessionLoading(false)
    }

    initializeSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionLoading(false)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const stats = useMemo(
    () => [
      { label: 'Productos', value: '24+' },
      { label: 'Disponibles', value: 'Hoy' },
      { label: 'Estilo', value: 'Premium' },
    ],
    []
  )

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/login'
  const isPublicRoute = !isAdminRoute

  const openCatalogWindow = () => {
    const url = `${window.location.origin}/catalog`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openAdminPanel = () => navigate(session ? '/admin/dashboard' : '/login')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    navigate('/login', { replace: true })
    toast.info('Sesión cerrada.')
  }

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  const currentNavItem = NAV_ITEMS.find((item) => item.to === location.pathname)

  if (location.pathname === '/login') {
    return (
      <AppRoutes
        selectedCategory={selectedCategory}
        onSelectCategory={(category) => {
          setSelectedCategory(category)
          navigate('/catalog')
        }}
        onRefreshCatalog={() => setRefreshKey((k) => k + 1)}
        onOpenCatalogWindow={openCatalogWindow}
        onOpenAdminPanel={openAdminPanel}
      />
    )
  }

  if (location.pathname.startsWith('/admin')) {
    if (sessionLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg)] text-[color:var(--text-secondary)]">
          Verificando acceso...
        </div>
      )
    }

    if (!session) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }
  }

  if (isPublicRoute) {
    return (
      <div className="theme-shell">
        <div className="catalog-shell">
          <header className="catalog-header">
            <div className="brand-block">
              <div className="brand-mark">M</div>
              <div>
                <p className="eyebrow">Boutique</p>
                <h1>Catálogo</h1>
              </div>
            </div>

            <div className="catalog-header__actions">
              <button type="button" onClick={toggleTheme} className="neon-button secondary">
                <Icon icon={theme === 'light' ? 'mdi:weather-night' : 'mdi:white-balance-sunny'} />
                {theme === 'light' ? 'Oscuro' : 'Claro'}
              </button>
              <button type="button" onClick={() => navigate(session ? '/admin/dashboard' : '/login')} className="neon-button primary">
                <Icon icon="mdi:shield-account" />
                {session ? 'Panel admin' : 'Admin'}
              </button>
            </div>
          </header>

          <AppRoutes
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => {
              setSelectedCategory(category)
              navigate('/catalog')
            }}
            onRefreshCatalog={() => setRefreshKey((k) => k + 1)}
            onOpenCatalogWindow={openCatalogWindow}
            onOpenAdminPanel={openAdminPanel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="theme-shell">
      <div className="admin-shell">
        <aside className={`relative flex shrink-0 flex-col border-r border-[color:var(--border-soft)] bg-[color:var(--admin-sidebar)] shadow-sm transition-all duration-200 ${sidebarOpen ? 'w-72' : 'w-24'}`}>
          <div className="flex items-center justify-between border-b border-[color:var(--border-soft)] p-4">
            <div className={`flex items-center gap-3 overflow-hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.35)]">
                <Icon icon="mdi:storefront" className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-pink-400">Admin</p>
                <h1 className="text-sm font-black text-[color:var(--text-primary)]">Panel</h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-alt)]"
              aria-label="Plegar menú"
            >
              <Icon icon={sidebarOpen ? 'mdi:chevron-double-left' : 'mdi:chevron-double-right'} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-3 p-3">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive: navIsActive }) => {
                    const active = navIsActive || (item.to === '/catalog' && location.pathname === '/')
                    return `group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      active ? 'admin-nav-link is-active' : 'admin-nav-link'
                    } ${sidebarOpen ? '' : 'justify-center'}`
                  }}
                >
                  <Icon icon={item.icon} className="text-lg" />
                  {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>

          <div className="space-y-3 border-t border-[color:var(--border-soft)] p-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-3 py-3 text-sm font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-alt)] ${sidebarOpen ? '' : 'px-2'}`}
            >
              <Icon icon={theme === 'light' ? 'mdi:weather-night' : 'mdi:white-balance-sunny'} />
              {sidebarOpen && (theme === 'light' ? 'Tema oscuro' : 'Tema claro')}
            </button>

            {session && (
              <button
                type="button"
                onClick={handleLogout}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 ${sidebarOpen ? '' : 'px-2'}`}
              >
                <Icon icon="mdi:logout" />
                {sidebarOpen && 'Cerrar sesión'}
              </button>
            )}

            <button
              type="button"
              onClick={openCatalogWindow}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-violet-500 to-fuchsia-500 px-3 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(217,70,239,0.35)] ${sidebarOpen ? '' : 'px-2'}`}
            >
              <Icon icon="mdi:open-in-new" />
              {sidebarOpen && 'Abrir catálogo'}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <header className="admin-topbar">
            <div>
              <p className="admin-topbar__eyebrow">Panel de administración</p>
              <h2 className="admin-topbar__title">{currentNavItem?.label || 'Panel'}</h2>
            </div>
            <div className="admin-topbar__user">
              <Icon icon="mdi:account-circle-outline" />
              <span>{session?.user?.email || 'Administrador'}</span>
            </div>
          </header>

          <section className="mb-8 grid gap-4 md:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-[color:var(--text-primary)]">{item.value}</p>
              </div>
            ))}
          </section>

          <div className="rounded-[30px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4 shadow-[0_18px_35px_rgba(15,23,42,0.08)] md:p-6">
            <AppRoutes
              selectedCategory={selectedCategory}
              onSelectCategory={(category) => {
                setSelectedCategory(category)
                navigate('/catalog')
              }}
              onRefreshCatalog={() => setRefreshKey((k) => k + 1)}
              onOpenCatalogWindow={openCatalogWindow}
              onOpenAdminPanel={openAdminPanel}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
