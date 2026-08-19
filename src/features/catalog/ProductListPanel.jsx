import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import ProductModal from './ProductModal'
import { useProducts } from '../../hooks/useProducts'
import { normalizeText, validateDescription, validateImage, validatePrice, validateRequiredText, validateStock } from '../../utils/validation'

export default function ProductListPanel({ onProductChange }) {
  const { products, loading, fetchProducts, addProduct, editProduct, removeProduct, toggleProductStatus } = useProducts()
  const [modalMode, setModalMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = useMemo(
    () => products.filter((product) => `${product.nombre} ${product.categoria}`.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)

    const payload = {
      nombre: normalizeText(formData.get('nombre')),
      descripcion: normalizeText(formData.get('descripcion')),
      categoria: normalizeText(formData.get('categoria')),
      precio: Number(formData.get('precio')),
      stock: Number(formData.get('stock')),
    }

    const validationError =
      validateRequiredText(payload.nombre, 'El nombre') ||
      validateDescription(payload.descripcion) ||
      validateRequiredText(payload.categoria, 'La categoría') ||
      validatePrice(formData.get('precio')) ||
      validateStock(formData.get('stock'))

    if (validationError) {
      toast.warn(validationError)
      return
    }

    try {
      if (modalMode === 'create') {
        const file = formData.get('imagen')
        if (file && file.size > 0) {
          const imageError = validateImage(file)
          if (imageError) {
            toast.warn(imageError)
            return
          }
        }
        await addProduct(payload, file && file.size > 0 ? file : null)
      }

      if (modalMode === 'edit' && selectedProduct) {
        await editProduct(selectedProduct.id, payload)
      }

      form.reset()
      setModalMode(null)
      setSelectedProduct(null)
      if (onProductChange) onProductChange()
    } catch (error) {
      // Error already handled in hook
    }
  }

  const handleDelete = async (product) => {
    const confirmDelete = window.confirm(`¿Eliminar "${product.nombre}"?`)
    if (!confirmDelete) return

    try {
      await removeProduct(product.id)
      if (onProductChange) onProductChange()
    } catch (error) {
      // Error already handled in hook
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
          title="Crear nuevo producto"
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
          title="Buscar productos por nombre o categoría"
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
              <th className="px-3 py-2.5 font-semibold hidden md:table-cell">Descripción</th>
              <th className="px-3 py-2.5 font-semibold">Precio</th>
              <th className="px-3 py-2.5 font-semibold">Categoría</th>
              <th className="px-3 py-2.5 font-semibold">Stock</th>
              <th className="px-3 py-2.5 font-semibold">Estado</th>
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
                  <td className="px-3 py-3 text-slate-500 text-xs hidden md:table-cell">
                    {product.descripcion?.length > 40 ? `${product.descripcion.substring(0, 40)}...` : (product.descripcion || 'Sin descripción')}
                  </td>
                  <td className="px-3 py-3 text-slate-700">${Number(product.precio || 0).toLocaleString('es-CO')}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-600">
                      {product.categoria || 'General'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{product.stock || 0}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${product.disponible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {product.disponible ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        title={product.disponible ? 'Desactivar producto' : 'Activar producto'}
                        onClick={async () => {
                          try {
                            await toggleProductStatus(product);
                            if (onProductChange) onProductChange();
                          } catch (err) {
                            // Error is handled in the hook
                          }
                        }}
                        className={`rounded-full border p-2 ${product.disponible ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        aria-label={product.disponible ? 'Desactivar producto' : 'Activar producto'}
                      >
                        <Icon icon={product.disponible ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off-outline'} />
                      </button>
                      <button
                        type="button"
                        title="Ver detalles del producto"
                        onClick={() => {
                          setSelectedProduct(product)
                          setModalMode('view')
                        }}
                        className="rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-600 hover:bg-sky-100"
                        aria-label="Ver detalles"
                      >
                        <Icon icon="mdi:eye-outline" />
                      </button>
                      <button
                        type="button"
                        title="Editar producto"
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
                        title="Eliminar producto"
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
