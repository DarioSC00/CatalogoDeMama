import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import CatalogFilters from './CatalogFilters'
import { getProducts } from './productService'
import { getDriveDirectUrl } from '../../utils/drive'

const PAGE_SIZE = 8

export default function Catalogo({ selectedCategory = '' }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    category: selectedCategory,
    minPrice: '',
    maxPrice: '',
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProductos(data)
    } catch (error) {
      console.error(error)
      alert('No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: selectedCategory }))
  }, [selectedCategory])

  const categories = useMemo(
    () => [...new Set(productos.map((product) => product.categoria).filter(Boolean))],
    [productos]
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase()
    const min = Number(filters.minPrice || 0)
    const max = Number(filters.maxPrice || Number.MAX_SAFE_INTEGER)

    return productos.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.nombre?.toLowerCase().includes(normalizedSearch) ||
        product.descripcion?.toLowerCase().includes(normalizedSearch)

      const matchesCategory = !filters.category || product.categoria === filters.category
      const matchesMin = Number(product.precio || 0) >= min
      const matchesMax = Number(product.precio || 0) <= max

      return matchesSearch && matchesCategory && matchesMin && matchesMax
    })
  }, [productos, filters])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [filters.search, filters.category, filters.minPrice, filters.maxPrice])

  const resetFilters = () => {
    setFilters({
      search: '',
      category: selectedCategory,
      minPrice: '',
      maxPrice: '',
    })
  }

  if (loading) {
    return <div className="catalog-loading">Cargando catálogo...</div>
  }

  return (
    <div className="catalog-page">
      <CatalogFilters
        filters={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        categories={categories}
        onReset={resetFilters}
      />

      <div className="catalog-summary">
        <span>{filteredProducts.length} productos</span>
        <span>
          Página {page} de {totalPages}
        </span>
      </div>

      {currentProducts.length ? (
        <div className="catalogo-grid">
          {currentProducts.map((prod) => {
            const imageSrc = prod.url_imagen ? getDriveDirectUrl(prod.url_imagen) : ''

            return (
              <article key={prod.id} className="catalog-card">
                <div className="catalog-card__image-wrap">
                  <img src={imageSrc} alt={prod.nombre} loading="lazy" />
                  <span className="catalog-card__tag">{prod.categoria || 'General'}</span>
                </div>

                <div className="catalog-card__content">
                  <h3>{prod.nombre}</h3>
                  <p>{prod.descripcion || 'Producto destacado de la colección.'}</p>

                  <div className="catalog-card__footer">
                    <p className="catalog-card__price">${Number(prod.precio || 0).toLocaleString('es-CO')}</p>
                    <button type="button" className="catalog-card__cta">
                      <Icon icon="mdi:cart-plus" />
                      Ver más
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="catalog-empty-state">No se encontraron productos con esos filtros.</div>
      )}

      {filteredProducts.length > PAGE_SIZE && (
        <div className="catalog-pagination">
          <button type="button" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
            Anterior
          </button>
          <span>{page}</span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
