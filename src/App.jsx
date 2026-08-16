import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

const NAV_ITEMS = [
  { to: '/catalog', label: 'Catálogo', icon: 'mdi:storefront-outline' },
  { to: '/admin/categories', label: 'Categorías', icon: 'mdi:tag-outline' },
  { to: '/admin/products', label: 'Productos', icon: 'mdi:package-variant-closed' },
]

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const stats = useMemo(
    () => [
      { label: 'Productos', value: '24+' },
      { label: 'Disponibles', value: 'Hoy' },
      { label: 'Estilo', value: 'Premium' },
    ],
    []
  )

  const openCatalogWindow = () => {
    const url = `${window.location.origin}/catalog`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-[#f7f2ee] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside
          className={`relative flex shrink-0 flex-col border-r border-rose-100 bg-[#fffdfc] shadow-sm transition-all duration-200 ${sidebarOpen ? 'w-72' : 'w-24'}`}
        >
          <div className="flex items-center justify-between border-b border-rose-100 p-4">
            <div className={`flex items-center gap-3 overflow-hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg shadow-rose-200">
                <Icon icon="mdi:storefront" className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500">Boutique</p>
                <h1 className="text-sm font-black text-slate-900">Catálogo</h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
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
                      active ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'
                    } ${sidebarOpen ? '' : 'justify-center'}`
                  }}
                >
                  <Icon icon={item.icon} className="text-lg" />
                  {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>

          <div className="border-t border-rose-100 p-3">
            <button
              type="button"
              onClick={openCatalogWindow}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-3 py-3 text-sm font-bold text-white shadow-sm ${sidebarOpen ? '' : 'px-2'}`}
            >
              <Icon icon="mdi:open-in-new" />
              {sidebarOpen && 'Abrir catálogo'}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <section className="mb-8 grid gap-4 md:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-slate-900">{item.value}</p>
              </div>
            ))}
          </section>

          <div className="rounded-[30px] border border-rose-100 bg-white p-4 shadow-sm md:p-6">
            <AppRoutes
              selectedCategory={selectedCategory}
              onSelectCategory={(category) => {
                setSelectedCategory(category)
                navigate('/catalog')
              }}
              onRefreshCatalog={() => setRefreshKey((k) => k + 1)}
              onOpenCatalogWindow={openCatalogWindow}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
