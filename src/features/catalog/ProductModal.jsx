import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { getCategories } from '../categories/categoryService'

export default function ProductModal({ product, onClose, onSubmit, mode = 'create' }) {
  const isEdit = mode === 'edit'
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('No se pudieron cargar las categorías:', error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">{isEdit ? 'Editar' : 'Crear'}</p>
            <h3 className="text-2xl font-black text-slate-900">{isEdit ? 'Producto' : 'Nuevo producto'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
          >
            <Icon icon="mdi:close" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Nombre
            <input
              defaultValue={product?.nombre || ''}
              name="nombre"
              required
              minLength={2}
              maxLength={80}
              className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Precio
            <input
              defaultValue={product?.precio || ''}
              name="precio"
              type="number"
              min="0"
              step="0.01"
              required
              className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Categoría
            <input
              defaultValue={product?.categoria || ''}
              name="categoria"
              list="product-categories"
              placeholder="Selecciona una categoría"
              required
              minLength={2}
              maxLength={80}
              className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
            />
            <datalist id="product-categories">
              {categories.map((category) => (
                <option key={category.id} value={category.nombre} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Descripción
            <textarea
              defaultValue={product?.descripcion || ''}
              name="descripcion"
              rows={4}
              required
              minLength={10}
              maxLength={500}
              className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Stock
            <input
              defaultValue={product?.stock || ''}
              name="stock"
              type="number"
              min="0"
              step="1"
              required
              className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
            />
          </label>

          {!isEdit && (
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Imagen
              <input type="file" name="imagen" accept="image/*" required className="rounded-2xl border border-rose-200 bg-white px-3 py-2" />
            </label>
          )}

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800">
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
