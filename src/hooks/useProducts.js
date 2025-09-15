// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useCallback, useEffect, useState } from "react";
import { produits_list, produits_create, produits_update } from "@/lib/db";import { isTauri } from "@/lib/runtime/isTauri";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await produits_list();
      setProducts(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(
    async (product) => {
      await produits_create(product);
      await fetchProducts();
      return { error: null };
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (id, fields) => {
      await produits_update(id, fields);
      await fetchProducts();
      return { error: null };
    },
    [fetchProducts]
  );

  const toggleProductActive = useCallback(
    (id, actif) => updateProduct(id, { actif }),
    [updateProduct]
  );

  const getProduct = useCallback(
    (id) => products.find((p) => p.id === id) || null,
    [products]
  );

  const fetchProductPrices = useCallback(async () => [], []);

  return {
    data: products,
    count: products.length,
    products,
    isLoading: loading,
    error,
    refetch: fetchProducts,
    addProduct,
    updateProduct,
    toggleProductActive,
    getProduct,
    fetchProductPrices,
    fetchProducts
  };
}

export default useProducts;