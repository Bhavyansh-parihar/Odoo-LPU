import api, { mockDelay } from './api';

export const inventoryService = {
  getProducts: async () => {
    
    return api.get('/products');
  },
  getProductById: async (id) => {
    
    return api.get(`/products/${id}`);
  },
  createProduct: async (productData) => {
    
    return api.post('/products', productData);
  },
  updateProduct: async (id, productData) => {
    
    return api.put(`/products/${id}`, productData);
  },
  updateReorderRules: async (id, rules) => {
    
    return api.patch(`/products/${id}/reorder-rules`, rules);
  }
};
