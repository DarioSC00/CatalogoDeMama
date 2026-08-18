import { Icon } from '@iconify/react'

export default function CategoryModal({ mode, category, onClose, onSubmit }) {
  const isEdit = mode === 'edit'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">{isEdit ? 'Editar' : 'Crear'}</p>
            <h3 className="text-2xl font-black text-slate-900">{isEdit ? 'Categoría' : 'Nueva categoría'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
          >
            <Icon icon="mdi:close" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Nombre de la categoría
            <input
              name="nombre"
              defaultValue={category?.nombre || ''}
              required
              minLength={2}
              maxLength={80}
              className="rounded-2xl border border-rose-200 bg-white px-3 py-2 outline-none transition focus:border-rose-400"
            />
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800">
              {isEdit ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
