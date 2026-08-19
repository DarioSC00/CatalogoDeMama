import { useState } from 'react'
import { toast } from 'react-toastify'
import imageCompression from 'browser-image-compression'
import { supabase } from '../supabaseClient'
import { normalizeText, validateDescription, validateImage, validatePrice, validateRequiredText } from '../utils/validation'
import { analyzeProductImage, generateEmbedding, generateProductDescription } from '../services/aiService'
export default function NuevoProducto({ onProductoCreado }) {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [imagen, setImagen] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const manejarSubida = async (e) => {
    e.preventDefault()

    const validationError =
      validateRequiredText(nombre, 'El nombre') ||
      validatePrice(precio) ||
      validateRequiredText(categoria, 'La categoría') ||
      validateDescription(descripcion) ||
      validateImage(imagen)

    if (validationError) return toast.warn(validationError)

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

      let embeddingStr = null;
      try {
        const textToEmbed = `${normalizeText(nombre)} ${normalizeText(descripcion)} ${normalizeText(categoria)}`;
        const embedding = await generateEmbedding(textToEmbed);
        embeddingStr = `[${embedding.join(',')}]`;
      } catch (err) {
        console.warn('No se pudo generar embedding en NuevoProducto', err);
      }

      const { error: dbError } = await supabase.from('productos').insert([
        {
          nombre: normalizeText(nombre),
          precio: Number(precio),
          descripcion: normalizeText(descripcion),
          categoria: normalizeText(categoria),
          url_imagen: urlData.publicUrl,
          ...(embeddingStr ? { embedding: embeddingStr } : {})
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
      toast.error(err.message || 'No se pudo guardar el producto.')
    } finally {
      setSubiendo(false)
    }
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    setImagen(file);

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

  const handleMagicDescription = async () => {
    if (!nombre || !categoria) {
      toast.warn('Ingresa un nombre y una categoría primero.', { toastId: 'description-fields-required' })
      return;
    }
    try {
      setAiLoading(true);
      const generated = await generateProductDescription(nombre, categoria);
      setDescripcion(generated);
    } catch (error) {
      toast.error(error.message || 'No se pudo generar la descripción.')
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={manejarSubida} className="form-producto">
      <h2>Agregar Nuevo Producto</h2>
      <input type="text" placeholder="Nombre del producto" value={nombre} onChange={(e) => setNombre(e.target.value)} minLength={2} maxLength={80} required />
      <input type="number" placeholder="Precio (COP)" value={precio} onChange={(e) => setPrecio(e.target.value)} min="0.01" step="0.01" required />
      <input type="text" placeholder="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} minLength={2} maxLength={80} required />
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <textarea style={{ flex: 1 }} placeholder="Descripción corta" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} minLength={10} maxLength={500} required />
        <button type="button" onClick={handleMagicDescription} disabled={aiLoading} style={{ padding: '8px', fontSize: '12px', height: 'fit-content', background: 'var(--neon-accent)' }}>
          ✨ IA
        </button>
      </div>

      <input type="file" accept="image/*" onChange={handleImageSelect} required />
      {aiLoading && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🤖 IA analizando...</p>}
      <button type="submit" disabled={subiendo}>{subiendo ? 'Guardando y optimizando...' : 'Guardar Producto'}</button>
    </form>
  )
}
