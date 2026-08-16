import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import CatalogFilters from './CatalogFilters'
import ProductModal from './ProductModal'
import { createProduct, deleteProduct, getProducts, updateProduct, uploadImageToStorage } from './productService'
import { getDriveDirectUrl } from '../../utils/drive'

const PAGE_SIZE = 8

export default function Catalogo({ selectedCategory = '' }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)

    const payload = {
      nombre: String(formData.get('nombre') || '').trim(),
      descripcion: String(formData.get('descripcion') || '').trim(),
      categoria: String(formData.get('categoria') || '').trim(),
      precio: Number(formData.get('precio') || 0),
    }

    try {
      if (modalMode === 'create') {
        const file = formData.get('imagen')
        if (!file || !(file instanceof File)) {
          alert('Debes seleccionar una imagen.')
          return
        }

        const publicUrl = await uploadImageToStorage(file)
        await createProduct({ ...payload, url_imagen: publicUrl, disponible: true })
      }

      if (modalMode === 'edit' && selectedProduct) {
        await updateProduct(selectedProduct.id, payload)
      }

      form.reset()
      setModalMode(null)
      setSelectedProduct(null)
      await fetchProducts()
    } catch (error) {
      console.error(error)
      alert('No se pudo guardar el producto.')
    }
  }

  const handleDelete = async (product) => {
    const confirmDelete = window.confirm(`¿Eliminar "${product.nombre}"?`)
    if (!confirmDelete) return

    try {
      await deleteProduct(product.id)
      await fetchProducts()
    } catch (error) {
      console.error(error)
      alert('No se pudo eliminar el producto.')
    }
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category: selectedCategory,
      minPrice: '',
      maxPrice: '',
    })
  }

  if (loading) {
    return <div className="py-10 text-center text-slate-500">Cargando catálogo...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">Colección</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Catálogo completo</h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalMode('create')
            setSelectedProduct(null)
          }}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Icon icon="mdi:plus" />
          Agregar producto
        </button>
      </div>

      <CatalogFilters
        filters={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        categories={categories}
        onReset={resetFilters}
      />

      <div className="flex items-center justify-between text-sm text-slate-500">
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
              <article key={prod.id} className="card-producto">
                <img src={imageSrc} alt={prod.nombre} loading="lazy" />
                <div className="card-content">
                  <span className="mb-2 inline-block rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">
                    {prod.categoria || 'General'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{prod.nombre}</h3>
                  <p className="mt-2 text-sm text-slate-600">{prod.descripcion}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-black text-rose-500">
                      ${Number(prod.precio || 0).toLocaleString('es-CO')}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(prod)
                          setModalMode('edit')
                        }}
                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
                        aria-label="Editar"
                      >
                        <Icon icon="mdi:pencil" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prod)}
                        className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                        aria-label="Eliminar"
                      >
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 p-8 text-center text-slate-500">
          No se encontraron productos con esos filtros.
        </div>
      )}

      {filteredProducts.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm font-medium text-slate-600">{page}</span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {modalMode && (
        <ProductModal
          mode={modalMode}
          product={selectedProduct}
          onClose={() => {
            setModalMode(null)
            setSelectedProduct(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
