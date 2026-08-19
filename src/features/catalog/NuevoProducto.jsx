import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import imageCompression from 'browser-image-compression'
import { supabase } from '../../supabaseClient'
import { getCategories } from '../categories/categoryService'
import { normalizeText, validateDescription, validateImage, validatePrice, validateRequiredText } from '../../utils/validation'

export default function NuevoProducto({ onProductoCreado }) {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagen, setImagen] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
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

  const manejarSubida = async (e) => {
    e.preventDefault()

    const validationError =
      validateRequiredText(nombre, 'El nombre') ||
      validatePrice(precio) ||
      validateRequiredText(categoria, 'La categoría') ||
      validateDescription(descripcion) ||
      validateImage(imagen)

    if (validationError) {
      toast.warn(validationError)
      return
    }

    try {
      setSubiendo(true)

      const opcionesCompresion = {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      }

      const imagenComprimida = await imageCompression(imagen, opcionesCompresion)
      const nombreArchivo = `${Date.now()}_${imagen.name.replace(/\s+/g, '_')}`

      const { error: storageError } = await supabase.storage
        .from('fotos-catalogo')
        .upload(nombreArchivo, imagenComprimida)

      if (storageError) throw storageError

      const { data: urlData } = supabase.storage
        .from('fotos-catalogo')
        .getPublicUrl(nombreArchivo)

      const { error: dbError } = await supabase.from('productos').insert([
        {
          nombre: normalizeText(nombre),
          precio: Number(precio),
          descripcion: normalizeText(descripcion),
          categoria: normalizeText(categoria),
          url_imagen: urlData.publicUrl,
          disponible: true,
        },
      ])

      if (dbError) throw dbError

      toast.success('Producto agregado con éxito.')
      setNombre('')
      setPrecio('')
      setDescripcion('')
      setCategoria('')
      setImagen(null)
      if (onProductoCreado) onProductoCreado()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo guardar el producto.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={manejarSubida} className="form-producto">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
          <Icon icon="mdi:plus-box" className="text-lg" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Admin</p>
          <h2>Nuevo producto</h2>
        </div>
      </div>

      <input type="text" placeholder="Nombre del producto" value={nombre} onChange={(e) => setNombre(e.target.value)} minLength={2} maxLength={80} required />
      <input type="number" placeholder="Precio (COP)" value={precio} onChange={(e) => setPrecio(e.target.value)} min="0.01" step="0.01" required />
      <input
        type="text"
        list="nuevo-producto-categories"
        placeholder="Categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        minLength={2}
        maxLength={80}
        required
      />
      <datalist id="nuevo-producto-categories">
        {categories.map((category) => (
          <option key={category.id} value={category.nombre} />
        ))}
      </datalist>
      <textarea placeholder="Descripción corta" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} minLength={10} maxLength={500} required />
      <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} required />

      <button type="submit" disabled={subiendo}>
        {subiendo ? 'Guardando...' : 'Guardar producto'}
      </button>
    </form>
  )
}
