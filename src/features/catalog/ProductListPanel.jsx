import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import ProductModal from './ProductModal'
import { createProduct, deleteProduct, getProducts, updateProduct, uploadImageToStorage } from './productService'

export default function ProductListPanel({ onProductChange }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(
    () => products.filter((product) => `${product.nombre} ${product.categoria}`.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  )

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
          toast.warn('Debes seleccionar una imagen.')
          return
        }

        const publicUrl = await uploadImageToStorage(file)
        await createProduct({ ...payload, url_imagen: publicUrl, disponible: true })
        toast.success('Producto creado correctamente.')
      }

      if (modalMode === 'edit' && selectedProduct) {
        await updateProduct(selectedProduct.id, payload)
        toast.success('Producto actualizado.')
      }

      form.reset()
      setModalMode(null)
      setSelectedProduct(null)
      await fetchProducts()
      if (onProductChange) onProductChange()
    } catch (error) {
      console.error(error)
      toast.error(error?.message || 'No se pudo guardar el producto.')
    }
  }

  const handleDelete = async (product) => {
    const confirmDelete = window.confirm(`¿Eliminar "${product.nombre}"?`)
    if (!confirmDelete) return

    try {
      await deleteProduct(product.id)
      await fetchProducts()
      if (onProductChange) onProductChange()
      toast.success('Producto eliminado.')
    } catch (error) {
      console.error(error)
      toast.error(error?.message || 'No se pudo eliminar el producto.')
    }
  }

  return (
    <div className="rounded-[26px] border border-rose-100 bg-[#fffaf9] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-500">Productos</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setModalMode('create')
            setSelectedProduct(null)
          }}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Icon icon="mdi:plus" />
          Crear
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar producto"
          className="w-full rounded-2xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-rose-400"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Nombre</th>
              <th className="px-3 py-2.5 font-semibold">Precio</th>
              <th className="px-3 py-2.5 font-semibold">Categoría</th>
              <th className="px-3 py-2.5 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-500">
                  Cargando productos...
                </td>
              </tr>
            ) : filteredProducts.length ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-3 font-medium text-slate-700">{product.nombre}</td>
                  <td className="px-3 py-3 text-slate-700">${Number(product.precio || 0).toLocaleString('es-CO')}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-600">
                      {product.categoria || 'General'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product)
                          setModalMode('edit')
                        }}
                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
                        aria-label="Editar producto"
                      >
                        <Icon icon="mdi:pencil" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                        aria-label="Eliminar producto"
                      >
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-500">
                  No hay productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
