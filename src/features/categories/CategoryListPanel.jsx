import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import CategoryModal from './CategoryModal'
import { createCategory, deleteCategory, getCategories, updateCategory } from './categoryService'
import { normalizeText, validateRequiredText } from '../../utils/validation'

export default function CategoryListPanel({ onCategoryChange, selectedCategory }) {
  const [categories, setCategories] = useState([])
  const [modalMode, setModalMode] = useState(null)
  const [selectedCategoryItem, setSelectedCategoryItem] = useState(null)
  const [search, setSearch] = useState('')

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

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.nombre?.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)
    const nombre = normalizeText(formData.get('nombre'))
    const descripcion = normalizeText(formData.get('descripcion')) || null

    const validationError = validateRequiredText(nombre, 'El nombre de la categoría')
    if (validationError) {
      toast.warn(validationError)
      return
    }

    try {
      if (modalMode === 'create') {
        await createCategory({ nombre, descripcion, disponible: true })
        toast.success('Categoría creada correctamente.')
      }

      if (modalMode === 'edit' && selectedCategoryItem) {
        await updateCategory(selectedCategoryItem.id, { nombre, descripcion })
        toast.success('Categoría actualizada.')
      }

      form.reset()
      setModalMode(null)
      setSelectedCategoryItem(null)
      await fetchCategories()
    } catch (error) {
      console.error(error)
      toast.error(error?.message || 'No se pudo guardar la categoría.')
    }
  }

  const handleDelete = async (category) => {
    const confirmDelete = window.confirm(`¿Eliminar la categoría "${category.nombre}"?`)
    if (!confirmDelete) return

    try {
      await deleteCategory(category.id)
      await fetchCategories()
      toast.success('Categoría eliminada.')
      if (onCategoryChange && selectedCategory === category.nombre) {
        onCategoryChange('')
      }
    } catch (error) {
      console.error(error)
      toast.error(error?.message || 'No se pudo eliminar la categoría.')
    }
  }

  return (
    <div className="rounded-[26px] border border-rose-100 bg-[#fffaf9] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-rose-500">Categorías</p>
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
          Crear
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar categoría"
          className="w-full rounded-2xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-rose-400"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Nombre</th>
              <th className="px-3 py-2.5 font-semibold">Descripción</th>
              <th className="px-3 py-2.5 font-semibold">Estado</th>
              <th className="px-3 py-2.5 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length ? (
              filteredCategories.map((category) => (
                <tr key={category.id} className="border-t border-slate-100">
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onCategoryChange?.(category.nombre)}
                      className={`font-semibold ${selectedCategory === category.nombre ? 'text-rose-600' : 'text-slate-700'}`}
                    >
                      {category.nombre}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-slate-500">
                      {category.descripcion || <span className="italic opacity-50">Sin descripción</span>}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${category.disponible !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {category.disponible !== false ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const newState = category.disponible === false ? true : false;
                            await updateCategory(category.id, { disponible: newState });
                            toast.success(`Categoría ${newState ? 'activada' : 'desactivada'}.`);
                            await fetchCategories();
                          } catch (err) {
                            toast.error('Error al cambiar el estado.');
                          }
                        }}
                        className={`rounded-full border p-2 ${category.disponible !== false ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        aria-label={category.disponible !== false ? 'Desactivar categoría' : 'Activar categoría'}
                      >
                        <Icon icon={category.disponible !== false ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryItem(category)
                          setModalMode('edit')
                        }}
                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
                        aria-label="Editar categoría"
                      >
                        <Icon icon="mdi:pencil" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                        aria-label="Eliminar categoría"
                      >
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-500">
                  No hay categorías.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
