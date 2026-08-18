export const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ')

export const validateRequiredText = (value, label, { min = 2, max = 80 } = {}) => {
  const text = normalizeText(value)
  if (!text) return `${label} es obligatorio.`
  if (text.length < min) return `${label} debe tener al menos ${min} caracteres.`
  if (text.length > max) return `${label} no puede superar ${max} caracteres.`
  return ''
}

export const validateDescription = (value) => {
  const description = normalizeText(value)
  if (!description) return 'La descripción es obligatoria.'
  if (description.length < 10) return 'La descripción debe tener al menos 10 caracteres.'
  if (description.length > 500) return 'La descripción no puede superar 500 caracteres.'
  return ''
}

export const validatePrice = (value) => {
  const price = Number(value)
  if (!String(value).trim() || !Number.isFinite(price)) return 'El precio es obligatorio.'
  if (price <= 0) return 'El precio debe ser mayor que cero.'
  if (price > 999999999) return 'El precio es demasiado alto.'
  return ''
}

export const validateStock = (value) => {
  const stock = Number(value)
  if (!String(value).trim() || !Number.isInteger(stock)) return 'El stock debe ser un número entero.'
  if (stock < 0) return 'El stock no puede ser negativo.'
  return ''
}

export const validateImage = (file) => {
  if (!file || file.size === 0) return 'Debes seleccionar una imagen.'
  if (!file.type.startsWith('image/')) return 'El archivo debe ser una imagen.'
  if (file.size > 5 * 1024 * 1024) return 'La imagen no puede superar 5 MB.'
  return ''
}