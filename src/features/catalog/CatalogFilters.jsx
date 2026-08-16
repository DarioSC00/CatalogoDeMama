import { Icon } from '@iconify/react'

export default function CatalogFilters({ filters, onChange, categories, onReset }) {
  return (
    <div className="grid gap-4 rounded-3xl border border-rose-100 bg-rose-50/70 p-4 md:grid-cols-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Buscar
        <input
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Nombre o descripción"
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none ring-0 transition focus:border-rose-400"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Categoría
        <select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Precio mínimo
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => onChange('minPrice', e.target.value)}
          placeholder="0"
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Precio máximo
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => onChange('maxPrice', e.target.value)}
          placeholder="500000"
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
        />
      </label>

      <div className="flex items-end md:col-span-4">
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50"
        >
          <Icon icon="mdi:filter-remove-outline" />
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
