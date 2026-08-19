import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import CatalogFilters from './CatalogFilters'
import { getProducts, searchProductsSemantically } from './productService'
import { getDriveDirectUrl } from '../../utils/drive'
import AIChatbot from '../../components/AIChatbot'

const PAGE_SIZE = 8

export default function Catalogo({ selectedCategory = '' }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    aiSearch: false,
    category: selectedCategory,
    minPrice: '',
    maxPrice: '',
  })
  const [aiSearchResults, setAiSearchResults] = useState(null)
  const [isSearchingAI, setIsSearchingAI] = useState(false)

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (filters.aiSearch && filters.search.trim()) {
        setIsSearchingAI(true)
        try {
          const results = await searchProductsSemantically(filters.search.trim(), 0.1, 20)
          setAiSearchResults(results)
        } catch (error) {
          console.error('Semantic search error:', error)
          setAiSearchResults([])
        } finally {
          setIsSearchingAI(false)
        }
      } else {
        setAiSearchResults(null)
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(delayDebounceFn)
  }, [filters.search, filters.aiSearch])

  const filteredProducts = useMemo(() => {
    const baseList = aiSearchResults !== null ? aiSearchResults : productos

    const normalizedSearch = filters.search.trim().toLowerCase()
    const min = Number(filters.minPrice || 0)
    const max = Number(filters.maxPrice || Number.MAX_SAFE_INTEGER)

    return baseList.filter((product) => {
      // If AI search is active, we don't filter by text match anymore, the vector DB did it.
      // We only apply text match if AI search is off.
      const matchesSearch = filters.aiSearch || !normalizedSearch ||
        product.nombre?.toLowerCase().includes(normalizedSearch) ||
        product.descripcion?.toLowerCase().includes(normalizedSearch)

      const matchesCategory = !filters.category || product.categoria === filters.category
      const matchesMin = Number(product.precio || 0) >= min
      const matchesMax = Number(product.precio || 0) <= max

      return matchesSearch && matchesCategory && matchesMin && matchesMax
    })
  }, [productos, aiSearchResults, filters])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [filters.search, filters.category, filters.minPrice, filters.maxPrice])

  const resetFilters = () => {
    setFilters({
      search: '',
      aiSearch: false,
      category: selectedCategory,
      minPrice: '',
      maxPrice: '',
    })
  }

  const featuredProduct = productos[0]
  const totalInventory = productos.reduce((total, product) => total + Number(product.stock || 0), 0)
  const averagePrice = productos.length
    ? productos.reduce((total, product) => total + Number(product.precio || 0), 0) / productos.length
    : 0

  if (loading) {
    return <div className="catalog-loading">Cargando catálogo...</div>
  }

  if (isSearchingAI) {
    return <div className="catalog-loading" style={{ flexDirection: 'column', gap: '10px' }}>
      <Icon icon="mdi:robot-outline" style={{ fontSize: '40px', color: 'var(--neon-accent)' }} className="animate-bounce" />
      <span>La IA está buscando las mejores coincidencias...</span>
    </div>
  }

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="catalog-hero__copy">
          <p className="eyebrow">Una selección hecha para ti</p>
          <h2>Encuentra algo<br /><em>extraordinario.</em></h2>
          <p className="catalog-hero__lead">Piezas especiales, elegidas con calma y presentadas para inspirar tu próxima elección.</p>
          <div className="catalog-hero__stats">
            <span><strong>{productos.length}</strong> piezas</span>
            <span><strong>{categories.length}</strong> colecciones</span>
          </div>
        </div>
        <div className="catalog-hero__visual">
          <div className="catalog-hero__orb" />
          {featuredProduct?.url_imagen ? (
            <img src={getDriveDirectUrl(featuredProduct.url_imagen)} alt={featuredProduct.nombre} />
          ) : (
            <Icon icon="mdi:sparkles" className="catalog-hero__sparkle" />
          )}
          <div className="catalog-hero__note"><Icon icon="mdi:star-four-points" /> Selección de hoy</div>
        </div>
      </section>

      <section className="catalog-insights" aria-label="Resumen del catálogo">
        <div><Icon icon="mdi:package-variant-closed" /><span>Inventario</span><strong>{totalInventory || productos.length} <small>unidades</small></strong></div>
        <div><Icon icon="mdi:shape-outline" /><span>Categorías</span><strong>{categories.length} <small>colecciones</small></strong></div>
        <div><Icon icon="mdi:tag-outline" /><span>Precio medio</span><strong>${Math.round(averagePrice).toLocaleString('es-CO')}</strong></div>
      </section>

      <div className="catalog-section-heading">
        <div><p className="eyebrow">Explora la colección</p><h2>Todo lo que te gusta</h2></div>
        <span>{filteredProducts.length} resultados</span>
      </div>

      <CatalogFilters
        filters={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        categories={categories}
        onReset={resetFilters}
      />

      <div className="catalog-summary">
        <span>Mostrando <strong>{filteredProducts.length}</strong> productos</span>
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
                  {imageSrc ? <img src={imageSrc} alt={prod.nombre} loading="lazy" /> : <div className="catalog-card__placeholder"><Icon icon="mdi:image-outline" /></div>}
                  <span className="catalog-card__tag">{prod.categoria || 'General'}</span>
                  <button type="button" className="catalog-card__favorite" aria-label={`Guardar ${prod.nombre}`}><Icon icon="mdi:heart-outline" /></button>
                </div>

                <div className="catalog-card__content">
                  <h3>{prod.nombre}</h3>
                  <p>{prod.descripcion || 'Producto destacado de la colección.'}</p>

                  <div className="catalog-card__footer">
                    <p className="catalog-card__price">${Number(prod.precio || 0).toLocaleString('es-CO')}</p>
                    <button type="button" className="catalog-card__cta" aria-label={`Ver ${prod.nombre}`}>
                      <Icon icon="mdi:arrow-top-right" />
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

      <AIChatbot />
    </div>
  )
}
