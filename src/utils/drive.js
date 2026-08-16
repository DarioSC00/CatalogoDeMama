// Convierte varios formatos de enlace de Google Drive a una URL directa que sirve la imagen.
export function getDriveDirectUrl(input) {
  if (!input || typeof input !== 'string') return input

  // Si ya parece una URL directa (cdn/lh3/uc), devuélvela
  if (input.includes('lh3.googleusercontent.com') || input.includes('=s') || input.includes('googleusercontent.com')) return input

  // Formato típico: https://drive.google.com/file/d/ID/view?usp=sharing
  let m = input.match(/\/d\/([a-zA-Z0-9_-]+)\//)
  if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`

  // Otro formato: https://drive.google.com/open?id=ID
  m = input.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`

  // Si solo envían el ID
  if (/^[a-zA-Z0-9_-]{10,}$/.test(input)) return `https://drive.google.com/uc?export=view&id=${input}`

  // Si no se pudo convertir, devolver la entrada original
  return input
}
