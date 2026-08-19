import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import { getCategories } from '../categories/categoryService'
import { analyzeProductImage, generateProductDescription } from '../../services/aiService'

export default function ProductModal({ product, onClose, onSubmit, mode = 'create' }) {
  const isEdit = mode === 'edit'
  const isView = mode === 'view'
  const [categories, setCategories] = useState([])
  const [nombre, setNombre] = useState(product?.nombre || '')
  const [categoria, setCategoria] = useState(product?.categoria || '')
  const [descripcion, setDescripcion] = useState(product?.descripcion || '')
  const [aiLoading, setAiLoading] = useState(false)

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

  const handleMagicDescription = async () => {
    const cleanName = nombre.trim()
    const cleanCategory = categoria.trim()
    if (!cleanName || !cleanCategory) {
      toast.warn('Ingresa un nombre y una categoría primero.', { toastId: 'description-fields-required' })
      return;
    }
    try {
      setAiLoading(true);
      const generated = await generateProductDescription(cleanName, cleanCategory);
      setDescripcion(generated);
    } catch (error) {
      toast.error(error.message || 'No se pudo generar la descripción.')
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setAiLoading(true);
        const data = await analyzeProductImage(file);
        if (data.categoria && !categoria) {
          setCategoria(data.categoria);
        }
        if (data.etiquetas && data.etiquetas.length > 0) {
          const tagsString = data.etiquetas.join(', ');
          setDescripcion((prev) => (prev ? `${prev}\n\nEtiquetas: ${tagsString}` : `Etiquetas: ${tagsString}`));
        }
      } catch (error) {
        console.error('Error al analizar imagen con IA:', error);
      } finally {
        setAiLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">{isView ? 'Detalles' : isEdit ? 'Editar' : 'Crear'}</p>
            <h3 className="text-2xl font-black text-slate-900">{isView ? 'Ver producto' : isEdit ? 'Producto' : 'Nuevo producto'}</h3>
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
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              name="nombre"
              required
              minLength={2}
              maxLength={80}
              disabled={isView}
              className={`rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400 ${isView ? 'opacity-70 bg-slate-50' : ''}`}
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
              disabled={isView}
              className={`rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400 ${isView ? 'opacity-70 bg-slate-50' : ''}`}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Categoría
            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              name="categoria"
              list="product-categories"
              placeholder="Selecciona una categoría"
              required
              disabled={isView}
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                name="descripcion"
                rows={4}
                required
                minLength={10}
                maxLength={500}
                disabled={isView}
                className={`w-full rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400 ${isView ? 'opacity-70 bg-slate-50' : ''}`}
              />
              {!isView && (
                <button 
                  type="button" 
                  onClick={handleMagicDescription} 
                  disabled={aiLoading} 
                  className="mt-1 flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-100 disabled:opacity-50"
                >
                  <Icon icon="mdi:magic" /> IA
                </button>
              )}
            </div>
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
              disabled={isView}
              className={`rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400 ${isView ? 'opacity-70 bg-slate-50' : ''}`}
            />
          </label>

          {!isEdit && !isView && (
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Imagen
              <input type="file" name="imagen" accept="image/*" onChange={handleImageSelect} required className="rounded-2xl border border-rose-200 bg-white px-3 py-2" />
              {aiLoading && <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Icon icon="mdi:loading" className="animate-spin" /> IA analizando...</p>}
            </label>
          )}

          {isView && product?.url_imagen && (
            <div className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
              Imagen
              <img src={product.url_imagen} alt={product.nombre} className="max-h-48 rounded-xl object-contain border border-slate-200 bg-slate-50" />
            </div>
          )}

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100">
              {isView ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isView && (
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800">
                {isEdit ? 'Guardar cambios' : 'Crear producto'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
