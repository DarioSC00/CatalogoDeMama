import { Icon } from '@iconify/react'

export default function CatalogFilters({ filters, onChange, categories, onReset }) {
  return (
    <div className="catalog-filter-panel">
      <div className="catalog-filter-heading">
        <div><Icon icon="mdi:tune-variant" /><span>Filtrar piezas</span></div>
        <span>Refina tu búsqueda</span>
      </div>
      <div className="catalog-filter-row">
        <label className="catalog-filter-field">
          <span>Buscar</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              style={{ flex: 1 }}
              value={filters.search}
              onChange={(e) => onChange('search', e.target.value)}
              placeholder="Ej: Ropa cómoda para el frío..."
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer', color: filters.aiSearch ? 'var(--neon-accent)' : 'inherit' }}>
              <input 
                type="checkbox" 
                checked={!!filters.aiSearch} 
                onChange={(e) => onChange('aiSearch', e.target.checked)} 
              />
              ✨ IA
            </label>
          </div>
        </label>

        <label className="catalog-filter-field">
          <span>Categoría</span>
          <select value={filters.category} onChange={(e) => onChange('category', e.target.value)}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="catalog-filter-field">
          <span>Precio mínimo</span>
          <input type="number" value={filters.minPrice} onChange={(e) => onChange('minPrice', e.target.value)} placeholder="0" />
        </label>

        <label className="catalog-filter-field">
          <span>Precio máximo</span>
          <input type="number" value={filters.maxPrice} onChange={(e) => onChange('maxPrice', e.target.value)} placeholder="500000" />
        </label>
      </div>

      <div className="catalog-filter-actions">
        <button type="button" onClick={onReset} className="catalog-filter-reset">
          <Icon icon="mdi:filter-remove-outline" />
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
