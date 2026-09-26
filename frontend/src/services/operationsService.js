import api, { mockDelay } from './api';

export const operationsService = {
  getReceipts: async () => {
    
    return api.get('/receipts');
  },
  createReceipt: async (data) => {
    
    return api.post('/receipts', data);
  },
  validateReceipt: async (id) => {
    
    return api.post(`/receipts/${id}/status`);
  },
  getDeliveries: async () => {
    
    return api.get('/delivery-orders');
  },
  createDelivery: async (data) => {
    
    return api.post('/delivery-orders', data);
  },
  validateDelivery: async (id) => {
    
    return api.post(`/delivery-orders/${id}/status`);
  },
  getTransfers: async () => {
    
    return api.get('/transfers');
  },
  createTransfer: async (data) => {
    
    return api.post('/transfers', data);
  },
  validateTransfer: async (id) => {
    
    return api.post(`/transfers/${id}/status`);
  },
  getAdjustments: async () => {
    
    return api.get('/adjustments');
  },
  applyAdjustment: async (id) => {
    
    return api.post(`/adjustments/${id}/status`);
  }
};
