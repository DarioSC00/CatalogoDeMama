import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { supabase } from '../supabaseClient'

export default function NuevoProducto({ onProductoCreado }) {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagen, setImagen] = useState(null)
  const [subiendo, setSubiendo] = useState(false)

  const manejarSubida = async (e) => {
    e.preventDefault()
    if (!imagen) return alert('Por favor selecciona una foto')

    try {
      setSubiendo(true)

      const opcionesCompresion = {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      }

      const imagenComprimida = await imageCompression(imagen, opcionesCompresion)

      const nombreArchivo = `${Date.now()}_${imagen.name.replace(/\s+/g, '_')}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('fotos-catalogo')
        .upload(nombreArchivo, imagenComprimida)

      if (storageError) throw storageError

      const { data: urlData } = supabase.storage.from('fotos-catalogo').getPublicUrl(nombreArchivo)

      const { error: dbError } = await supabase.from('productos').insert([
        {
          nombre,
          precio: parseFloat(precio) || 0,
          descripcion,
          categoria,
          url_imagen: urlData.publicUrl,
        },
      ])

      if (dbError) throw dbError

      alert('¡Producto agregado con éxito!')
      setNombre('')
      setPrecio('')
      setDescripcion('')
      setCategoria('')
      setImagen(null)
      if (onProductoCreado) onProductoCreado()
    } catch (err) {
      alert('Error al guardar el producto: ' + (err.message || err))
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={manejarSubida} className="form-producto">
      <h2>Agregar Nuevo Producto</h2>
      <input type="text" placeholder="Nombre del producto" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <input type="number" placeholder="Precio (COP)" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
      <input type="text" placeholder="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />
      <textarea placeholder="Descripción corta" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} required />
      <button type="submit" disabled={subiendo}>{subiendo ? 'Guardando y optimizando...' : 'Guardar Producto'}</button>
    </form>
  )
}
