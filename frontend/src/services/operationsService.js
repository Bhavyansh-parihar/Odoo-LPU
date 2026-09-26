import api, { mockDelay } from './api';

export const operationsService = {
  getReceipts: async () => {
    await mockDelay(200);
    // return api.get('/operations/receipts');
  },
  createReceipt: async (data) => {
    await mockDelay(350);
    // return api.post('/operations/receipts', data);
  },
  validateReceipt: async (id) => {
    await mockDelay(300);
    // return api.post(`/operations/receipts/${id}/validate`);
  },
  getDeliveries: async () => {
    await mockDelay(200);
    // return api.get('/operations/deliveries');
  },
  createDelivery: async (data) => {
    await mockDelay(350);
    // return api.post('/operations/deliveries', data);
  },
  validateDelivery: async (id) => {
    await mockDelay(300);
    // return api.post(`/operations/deliveries/${id}/validate`);
  },
  getTransfers: async () => {
    await mockDelay(200);
    // return api.get('/operations/transfers');
  },
  createTransfer: async (data) => {
    await mockDelay(350);
    // return api.post('/operations/transfers', data);
  },
  validateTransfer: async (id) => {
    await mockDelay(300);
    // return api.post(`/operations/transfers/${id}/validate`);
  },
  getAdjustments: async () => {
    await mockDelay(200);
    // return api.get('/operations/adjustments');
  },
  applyAdjustment: async (id) => {
    await mockDelay(300);
    // return api.post(`/operations/adjustments/${id}/apply`);
  }
};
