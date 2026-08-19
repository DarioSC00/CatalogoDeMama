import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Icon } from '@iconify/react'
import { createCategory, deleteCategory, getCategories, updateCategory } from './categoryService'
import CategoryModal from './CategoryModal'
import { normalizeText, validateRequiredText } from '../../utils/validation'

export default function CategoriesPanel({ onCategoryChange, selectedCategory }) {
  const [categories, setCategories] = useState([])
  const [modalMode, setModalMode] = useState(null)
  const [selectedCategoryItem, setSelectedCategoryItem] = useState(null)

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar las categorías.')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const nombre = normalizeText(new FormData(form).get('nombre'))

    const validationError = validateRequiredText(nombre, 'El nombre de la categoría')
    if (validationError) {
      toast.warn(validationError)
      return
    }

    try {
      if (modalMode === 'create') {
        await createCategory(nombre)
      }

      if (modalMode === 'edit' && selectedCategoryItem) {
        await updateCategory(selectedCategoryItem.id, nombre)
      }

      form.reset()
      setModalMode(null)
      setSelectedCategoryItem(null)
      await fetchCategories()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo guardar la categoría.')
    }
  }

  const handleDelete = async (category) => {
    const confirmDelete = window.confirm(`¿Eliminar la categoría "${category.nombre}"?`)
    if (!confirmDelete) return

    try {
      await deleteCategory(category.id)
      await fetchCategories()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo eliminar la categoría.')
    }
  }

  return (
    <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Categorías</p>
          <h3 className="text-xl font-black text-slate-900">Administrar</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setModalMode('create')
            setSelectedCategoryItem(null)
          }}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Icon icon="mdi:plus" />
          Nueva
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
            <button
              type="button"
              onClick={() => onCategoryChange(category.nombre)}
              className={`text-left text-sm font-semibold ${selectedCategory === category.nombre ? 'text-rose-600' : 'text-slate-700'}`}
            >
              {category.nombre}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryItem(category)
                  setModalMode('edit')
                }}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <Icon icon="mdi:pencil" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category)}
                className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
              >
                <Icon icon="mdi:trash-can-outline" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalMode && (
        <CategoryModal
          mode={modalMode}
          category={selectedCategoryItem}
          onClose={() => {
            setModalMode(null)
            setSelectedCategoryItem(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
