import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import { getProducts } from '../catalog/productService'
import { getDriveDirectUrl } from '../../utils/drive'

const COLORS = ['#e85d8c', '#7c6ee6', '#e6a23c', '#4eaa91', '#d979b2', '#718096']
const formatMoney = (value) => `$${Math.round(value).toLocaleString('es-CO')}`

function ProductRanking({ title, description, products, accent }) {
  return (
    <section className="dashboard-panel dashboard-ranking">
      <div className="dashboard-panel__heading">
        <div><p className="eyebrow">Inventario</p><h3>{title}</h3><p>{description}</p></div>
        <div className={`dashboard-ranking__icon ${accent}`}><Icon icon={title.startsWith('Más') ? 'mdi:trending-up' : 'mdi:trending-down'} /></div>
      </div>
      <div className="dashboard-ranking__list">
        {products.length ? products.map((product, index) => (
          <article key={product.id} className="dashboard-ranking__item">
            <span className="dashboard-ranking__number">0{index + 1}</span>
            {product.url_imagen ? <img src={getDriveDirectUrl(product.url_imagen)} alt="" /> : <span className="dashboard-ranking__placeholder"><Icon icon="mdi:image-outline" /></span>}
            <div><strong>{product.nombre}</strong><small>{product.categoria || 'General'}</small></div>
            <b>{Number(product.stock || 0)} <small>uds.</small></b>
          </article>
        )) : <p className="dashboard-empty">Todavía no hay productos.</p>}
      </div>
    </section>
  )
}

function CategoryDonut({ categories, total }) {
  let offset = 0
  const gradient = categories.length ? categories.map((category, index) => {
    const start = offset
    offset += (category.value / total) * 100
    return `${COLORS[index % COLORS.length]} ${start}% ${offset}%`
  }).join(', ') : '#e5e7eb 0 100%'

  return (
    <section className="dashboard-panel dashboard-donut-panel">
      <div className="dashboard-panel__heading"><div><p className="eyebrow">Distribución</p><h3>Colecciones</h3><p>Cómo se reparte tu inventario.</p></div><Icon icon="mdi:chart-donut" className="dashboard-panel__heading-icon" /></div>
      <div className="dashboard-donut-content">
        <div className="dashboard-donut" style={{ background: `conic-gradient(${gradient})` }}><div><strong>{total}</strong><span>productos</span></div></div>
        <div className="dashboard-legend">{categories.map((category, index) => <div key={category.name}><span style={{ backgroundColor: COLORS[index % COLORS.length] }} /><p>{category.name}</p><b>{category.value}</b></div>)}</div>
      </div>
    </section>
  )
}

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(await getProducts())
      } catch (error) {
        console.error(error)
        toast.error('No se pudieron cargar los datos del dashboard.')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const metrics = useMemo(() => {
    const stock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0)
    const value = products.reduce((sum, product) => sum + Number(product.stock || 0) * Number(product.precio || 0), 0)
    const categories = [...new Set(products.map((product) => product.categoria).filter(Boolean))]
    return { stock, value, categories }
  }, [products])

  const categoryData = useMemo(() => {
    const counts = products.reduce((result, product) => {
      const name = product.categoria || 'General'
      result[name] = (result[name] || 0) + 1
      return result
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [products])

  const barProducts = useMemo(() => [...products].sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0)).slice(0, 6), [products])
  const maxStock = Math.max(...barProducts.map((product) => Number(product.stock || 0)), 1)

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div><p className="eyebrow">Buenos días, admin</p><h2>Todo bajo control.</h2><p>Una mirada clara a tu tienda, tus productos y el ritmo de tu inventario.</p></div>
        <div className="dashboard-welcome__mark"><Icon icon="mdi:sparkles" /><span>Resumen<br />en vivo</span></div>
      </section>

      <section className="dashboard-metrics">
        <div><span className="dashboard-metric__icon pink"><Icon icon="mdi:package-variant-closed" /></span><p>Productos</p><strong>{loading ? '...' : products.length}</strong><small>en catálogo</small></div>
        <div><span className="dashboard-metric__icon green"><Icon icon="mdi:archive-check-outline" /></span><p>Unidades</p><strong>{loading ? '...' : metrics.stock}</strong><small>en inventario</small></div>
        <div><span className="dashboard-metric__icon amber"><Icon icon="mdi:cash-multiple" /></span><p>Valor inventario</p><strong>{loading ? '...' : formatMoney(metrics.value)}</strong><small>valor estimado</small></div>
        <div><span className="dashboard-metric__icon violet"><Icon icon="mdi:shape-outline" /></span><p>Categorías</p><strong>{loading ? '...' : metrics.categories.length}</strong><small>colecciones activas</small></div>
      </section>

      <section className="dashboard-chart-grid">
        <div className="dashboard-panel dashboard-bars-panel">
          <div className="dashboard-panel__heading"><div><p className="eyebrow">Existencias</p><h3>Productos con más stock</h3><p>Comparativa de unidades disponibles.</p></div><Icon icon="mdi:chart-bar" className="dashboard-panel__heading-icon" /></div>
          <div className="dashboard-bars">{barProducts.length ? barProducts.map((product, index) => <div className="dashboard-bar-row" key={product.id}><span>{product.nombre}</span><div><i style={{ width: `${(Number(product.stock || 0) / maxStock) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }} /></div><b>{product.stock || 0}</b></div>) : <p className="dashboard-empty">Agrega productos para ver el gráfico.</p>}</div>
        </div>
        <CategoryDonut categories={categoryData} total={products.length} />
      </section>

      <div className="dashboard-ranking-grid">
        <ProductRanking title="Más ingresaron" description="Los productos agregados recientemente." products={products.slice(0, 5)} accent="green" />
        <ProductRanking title="Menos ingresaron" description="Los productos con mayor antigüedad." products={[...products].reverse().slice(0, 5)} accent="amber" />
      </div>
    </div>
  )
}
