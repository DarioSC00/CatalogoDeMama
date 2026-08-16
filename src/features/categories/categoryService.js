import { supabase } from '../../supabaseClient'

const TABLE = 'categorias'

export async function getCategories() {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createCategory(nombre) {
  const { data, error } = await supabase.from(TABLE).insert([{ nombre }]).select().single()

  if (error) throw error
  return data
}

export async function updateCategory(id, nombre) {
  const { data, error } = await supabase.from(TABLE).update({ nombre }).eq('id', id).select().single()

  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) throw error
}
