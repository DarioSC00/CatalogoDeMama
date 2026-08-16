import { supabase } from '../../supabaseClient'

const TABLE = 'productos'

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
  const { data, error } = await supabase.from(TABLE).insert([product]).select().single()

  if (error) throw error
  return normalizeProduct(data)
}

export async function updateProduct(id, product) {
  const { data, error } = await supabase.from(TABLE).update(product).eq('id', id).select().single()

  if (error) throw error
  return normalizeProduct(data)
}

export async function deleteProduct(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) throw error
}

export async function uploadImageToStorage(file) {
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`

  const { error: uploadError } = await supabase.storage.from('fotos-catalogo').upload(fileName, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('fotos-catalogo').getPublicUrl(fileName)
  return data.publicUrl
}
