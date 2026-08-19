import { useState, useCallback } from 'react';
import { getProducts, searchProductsSemantically, createProduct, updateProduct, deleteProduct, uploadImageToStorage } from '../features/catalog/productService';
import { toast } from 'react-toastify';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (productData, imageFile) => {
    try {
      let publicUrl = '';
      if (imageFile) {
        publicUrl = await uploadImageToStorage(imageFile);
      }
      
      const newProduct = { ...productData, disponible: true };
      if (publicUrl) {
        newProduct.url_imagen = publicUrl;
      }
      
      await createProduct(newProduct);
      toast.success('Producto creado correctamente.');
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'No se pudo crear el producto.');
      throw err;
    }
  };

  const editProduct = async (id, productData) => {
    try {
      await updateProduct(id, productData);
      toast.success('Producto actualizado.');
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'No se pudo actualizar el producto.');
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado.');
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'No se pudo eliminar el producto.');
      throw err;
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const newState = !product.disponible;
      await updateProduct(product.id, { disponible: newState });
      toast.success(`Producto ${newState ? 'activado' : 'desactivado'}.`);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Error al cambiar el estado del producto.');
      throw err;
    }
  };

  const searchSemantically = async (query, threshold, limit) => {
    return await searchProductsSemantically(query, threshold, limit);
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    toggleProductStatus,
    searchSemantically,
    setProducts // Exposing if needed
  };
}
