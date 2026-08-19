import { useState, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../features/categories/categoryService';
import { toast } from 'react-toastify';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = async (categoryData) => {
    try {
      await createCategory({ ...categoryData, disponible: true });
      toast.success('Categoría creada correctamente.');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'No se pudo guardar la categoría.');
      throw err;
    }
  };

  const editCategory = async (id, categoryData) => {
    try {
      await updateCategory(id, categoryData);
      toast.success('Categoría actualizada.');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'No se pudo guardar la categoría.');
      throw err;
    }
  };

  const removeCategory = async (id) => {
    try {
      await deleteCategory(id);
      toast.success('Categoría eliminada.');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'No se pudo eliminar la categoría.');
      throw err;
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      const newState = category.disponible === false ? true : false;
      await updateCategory(category.id, { disponible: newState });
      toast.success(`Categoría ${newState ? 'activada' : 'desactivada'}.`);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error('Error al cambiar el estado.');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    toggleCategoryStatus
  };
}
