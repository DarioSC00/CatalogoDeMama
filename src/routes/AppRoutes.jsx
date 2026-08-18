import { Navigate, Route, Routes } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Catalogo from '../features/catalog/Catalogo'
import ProductListPanel from '../features/catalog/ProductListPanel'
import CategoryListPanel from '../features/categories/CategoryListPanel'
import LoginPage from '../features/auth/LoginPage'
import ProtectedRoute from './ProtectedRoute'
import Dashboard from '../features/dashboard/Dashboard'

function CatalogView({ selectedCategory, onSelectCategory, onOpenCatalogWindow, onOpenAdminPanel }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-500">Colección</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Catálogo completo</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            <Icon icon="mdi:arrow-left" />
            Volver al panel
          </button>
          <button
            type="button"
            onClick={onOpenCatalogWindow}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Icon icon="mdi:open-in-new" />
            Abrir en otra ventana
          </button>
        </div>
      </div>

      <Catalogo selectedCategory={selectedCategory} />
    </div>
  )
}

function CategoriesView({ selectedCategory, onSelectCategory }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-500">Administración</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Gestión de categorías</h2>
        </div>
      </div>

      <CategoryListPanel
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => {
          onSelectCategory(category)
        }}
      />
    </div>
  )
}

function ProductsView({ onRefreshCatalog }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-500">Administración</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Gestión de productos</h2>
        </div>
      </div>

      <ProductListPanel onProductChange={onRefreshCatalog} />
    </div>
  )
}

export default function AppRoutes({ selectedCategory, onSelectCategory, onRefreshCatalog, onOpenCatalogWindow, onOpenAdminPanel }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route
        path="/catalog"
        element={
          <CatalogView
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            onOpenCatalogWindow={onOpenCatalogWindow}
            onOpenAdminPanel={onOpenAdminPanel}
          />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute>
            <CategoriesView selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <ProductsView onRefreshCatalog={onRefreshCatalog} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  )
}
