import api, { mockDelay } from './api';

export const inventoryService = {
  getProducts: async () => {
    await mockDelay(250);
    // return api.get('/products');
  },
  getProductById: async (id) => {
    await mockDelay(200);
    // return api.get(`/products/${id}`);
  },
  createProduct: async (productData) => {
    await mockDelay(350);
    // return api.post('/products', productData);
  },
  updateProduct: async (id, productData) => {
    await mockDelay(300);
    // return api.put(`/products/${id}`, productData);
  },
  updateReorderRules: async (id, rules) => {
    await mockDelay(250);
    // return api.patch(`/products/${id}/reorder-rules`, rules);
  }
};
