import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getDriveDirectUrl } from '../utils/drive'

export default function Catalogo() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerProductos()
  }, [])

  const obtenerProductos = async () => {
    try {
      const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setProductos(data || [])
    } catch (err) {
      console.error('Error al cargar productos:', err.message)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return <p className="center">Cargando catálogo...</p>

  return (
    <div className="catalogo-grid">
      {productos.map((prod) => {
        const imageSrc = prod.url_imagen ? getDriveDirectUrl(prod.url_imagen) : ''
        return (
          <div key={prod.id} className="card-producto">
            <img src={imageSrc} alt={prod.nombre} loading="lazy" />
            <div className="card-content">
              <span className="categoria">{prod.categoria}</span>
              <h3>{prod.nombre}</h3>
              <p className="descripcion">{prod.descripcion}</p>
              <p className="precio">${Number(prod.precio).toLocaleString('es-CO')}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
