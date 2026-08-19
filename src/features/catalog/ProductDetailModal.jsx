import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import { getDriveDirectUrl } from '../../utils/drive'

export default function ProductDetailModal({ product, onClose }) {
  useEffect(() => {
    if (!product) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [product, onClose])

  if (!product) return null

  const imageSrc = product.url_imagen ? getDriveDirectUrl(product.url_imagen) : ''
  const isAvailable = product.disponible !== false && Number(product.stock || 0) > 0
  const stockLabel = isAvailable ? `${product.stock || 0} disponibles` : 'Agotado por ahora'

  return (
    <div className="product-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="product-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="product-detail-close" onClick={onClose} aria-label="Cerrar detalles">
          <Icon icon="mdi:close" />
        </button>

        <div className="product-detail-media">
          {imageSrc ? (
            <img src={imageSrc} alt={product.nombre} />
          ) : (
            <div className="product-detail-placeholder"><Icon icon="mdi:image-outline" /></div>
          )}
          <span className="product-detail-media__label"><Icon icon="mdi:sparkles" /> Pieza seleccionada</span>
        </div>

        <div className="product-detail-content">
          <div className="product-detail-kicker">
            <span>{product.categoria || 'Colección especial'}</span>
            <span className={isAvailable ? 'is-available' : 'is-unavailable'}>
              <i /> {stockLabel}
            </span>
          </div>
          <h2 id="product-detail-title">{product.nombre}</h2>
          <p className="product-detail-description">{product.descripcion || 'Una pieza especial de nuestra colección.'}</p>

          <div className="product-detail-meta">
            <div><span>Precio</span><strong>${Number(product.precio || 0).toLocaleString('es-CO')}</strong></div>
            <div><span>Disponibilidad</span><strong>{isAvailable ? 'Lista para ti' : 'Próximamente'}</strong></div>
          </div>

          <div className="product-detail-footer">
            <span><Icon icon="mdi:heart-outline" /> Elegido con cariño</span>
            <button type="button" className="neon-button primary" onClick={onClose}>
              <Icon icon="mdi:arrow-left" /> Volver a explorar
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}