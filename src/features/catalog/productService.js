import { supabase } from '../../supabaseClient'
import { generateEmbedding } from '../../services/aiService'

const TABLE = 'productos'
const IMAGE_BUCKET = 'fotos-catalogo'

const normalizeProduct = (product) => ({
  ...product,
  precio: Number(product.precio || 0),
  disponible: product.disponible ?? true,
})

export async function getProducts() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeProduct)
}

export async function createProduct(product) {
  try {
    const textToEmbed = `${product.nombre} ${product.descripcion} ${product.categoria}`;
    const embedding = await generateEmbedding(textToEmbed);
    product.embedding = `[${embedding.join(',')}]`;
  } catch (err) {
    console.warn('No se pudo generar embedding, guardando sin él.', err);
  }

  const { data, error } = await supabase.from(TABLE).insert([product]).select().single()

  if (error) throw error
  return normalizeProduct(data)
}

export async function updateProduct(id, product) {
  if (product.nombre || product.descripcion || product.categoria) {
    try {
      // In a real scenario we'd want the full text, this is simplified.
      const textToEmbed = `${product.nombre || ''} ${product.descripcion || ''} ${product.categoria || ''}`;
      const embedding = await generateEmbedding(textToEmbed);
      product.embedding = `[${embedding.join(',')}]`;
    } catch (err) {
      console.warn('No se pudo actualizar embedding.', err);
    }
  }

  const { data, error } = await supabase.from(TABLE).update(product).eq('id', id).select().single()

  if (error) throw error
  return normalizeProduct(data)
}

export async function searchProductsSemantically(query, threshold = 0.5, limit = 10) {
  try {
    const query_embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_productos', {
      query_embedding: `[${query_embedding.join(',')}]`,
      match_threshold: threshold,
      match_count: limit
    });
    if (error) throw error;
    return (data || []).map(normalizeProduct);
  } catch (error) {
    console.error('Error in semantic search:', error);
    return [];
  }
}

export async function deleteProduct(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) throw error
}

export async function uploadImageToStorage(file) {
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Selecciona un archivo de imagen válido.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no puede superar 5 MB.')
  }

  const safeName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileName = `${Date.now()}_${safeName}`

  const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    if (uploadError.message?.toLowerCase().includes('bucket not found')) {
      throw new Error('No existe el bucket fotos-catalogo. Ejecuta el bloque Storage de supabase/schema.sql en Supabase.')
    }

    throw uploadError
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}
