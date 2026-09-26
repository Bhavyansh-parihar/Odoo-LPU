import { create } from 'zustand';
import api from '../utils/api';

export const useInventoryStore = create((set, get) => ({
  products: [],
  categories: [],
  unitsOfMeasure: [{ id: 'uom-1', name: 'Pieces' }, { id: 'uom-2', name: 'Boxes' }], // Defaulting to mock if missing from API
  warehouses: [],
  activeWarehouseId: null,
  receipts: [],
  deliveries: [],
  transfers: [],
  adjustments: [],
  moveHistory: [], // Can be fetched from ledger endpoint

  setActiveWarehouseId: (id) => set({ activeWarehouseId: id }),

  // Initialization: fetch all primary data
  fetchInitialData: async () => {
    try {
      const [catRes, whRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/warehouses'),
        api.get('/products')
      ]);
      
      const categories = catRes.data?.data?.categories?.map(c => ({ ...c, id: c._id })) || [];
      const warehouses = whRes.data?.data?.warehouses?.map(w => ({ ...w, id: w._id, locations: (w.locations || []).map((l, i) => (typeof l === 'string' ? { id: `loc-${i}`, code: l, name: l, type: 'Internal' } : l)) })) || [];
      const products = prodRes.data?.data?.products?.map(p => ({ ...p, id: p._id, category: p.category?.name || p.category, minStock: p.reorderPoint || 0, totalStock: 0 })) || [];

      set({ 
        categories, 
        warehouses, 
        products,
        activeWarehouseId: warehouses.length > 0 ? warehouses[0].id : null
      });

      // After we have warehouses, we can fetch operations
      get().fetchOperations();
    } catch (e) {
      console.error('Failed to fetch initial data:', e);
    }
  },

  fetchOperations: async () => {
    try {
      // Assuming you have GET routes for these in your backend
      // Using Promise.allSettled so if one is missing it doesn't break the rest
      const endpoints = [
        api.get('/receipts').catch(() => ({ data: { data: [] } })),
        api.get('/delivery-orders').catch(() => ({ data: { data: [] } })),
        api.get('/transfers').catch(() => ({ data: { data: [] } })),
        api.get('/adjustments').catch(() => ({ data: { data: [] } })),
      ];
      const [recRes, delRes, trfRes, adjRes] = await Promise.all(endpoints);

      set({
        receipts: recRes.data?.data?.receipts?.map(r => ({ ...r, id: r._id, reference: r.receiptNo, date: r.createdAt?.split('T')[0], supplier: r.supplierName, destinationLocation: r.warehouse?.code || 'WH-MAIN' })) || [],
        deliveries: delRes.data?.data?.deliveryOrders?.map(d => ({ ...d, id: d._id, reference: d.deliveryNo, date: d.createdAt?.split('T')[0], customer: d.customerName, sourceLocation: d.warehouse?.code || 'WH-MAIN' })) || [],
        transfers: trfRes.data?.data?.transfers?.map(t => ({ ...t, id: t._id, reference: t.transferNo, date: t.createdAt?.split('T')[0], sourceLocation: t.fromLocation || 'WH-MAIN', destinationLocation: t.toLocation || 'WH-MAIN' })) || [],
        adjustments: adjRes.data?.data?.adjustments?.map(a => ({ ...a, id: a._id, reference: a._id.substring(a._id.length - 6).toUpperCase(), date: a.createdAt?.split('T')[0], location: a.location || 'WH-MAIN' })) || [],
      });
    } catch (e) {
      console.error('Failed to fetch operations:', e);
    }
  },

  // Products CRUD
  addProduct: async (productData) => {
    try {
      const res = await api.post('/products', productData);
      const newProduct = { ...res.data.data, id: res.data.data._id };
      set((state) => ({ products: [newProduct, ...state.products] }));
      return newProduct;
    } catch (error) {
      console.error('Add product failed:', error);
      throw error;
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      const res = await api.patch(`/products/${id}`, updatedData);
      set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, ...res.data.data, id: res.data.data._id } : p)
      }));
    } catch (error) {
      console.error('Update product failed:', error);
    }
  },

  addCategory: async (categoryData) => {
    try {
      const res = await api.post('/categories', categoryData);
      const newCat = { ...res.data.data, id: res.data.data._id };
      set((state) => ({ categories: [...state.categories, newCat] }));
    } catch (error) {
      console.error('Add category failed', error);
    }
  },

  // Receipts
  addReceipt: async (receiptData) => {
    try {
      const res = await api.post('/receipts', receiptData);
      const newRec = { ...res.data.data, id: res.data.data._id };
      set((state) => ({ receipts: [newRec, ...state.receipts] }));
      return newRec;
    } catch (error) {
      console.error('Add receipt failed', error);
      throw error;
    }
  },

  validateReceipt: async (receiptId, lines) => {
    try {
      const res = await api.patch(`/receipts/${receiptId}/status`, { status: 'done', lines });
      set((state) => ({
        receipts: state.receipts.map(r => r.id === receiptId ? { ...r, ...res.data.data, status: 'done', id: res.data.data._id } : r)
      }));
      // Refresh products to get updated stock
      get().fetchInitialData(); 
    } catch (error) {
      console.error('Validate receipt failed', error);
    }
  },

  // Deliveries
  addDelivery: async (deliveryData) => {
    try {
      const res = await api.post('/delivery-orders', deliveryData);
      const newDel = { ...res.data.data, id: res.data.data._id };
      set((state) => ({ deliveries: [newDel, ...state.deliveries] }));
      return newDel;
    } catch (error) {
      console.error('Add delivery failed', error);
      throw error;
    }
  },

  validateDelivery: async (deliveryId, lines) => {
    try {
      const res = await api.patch(`/delivery-orders/${deliveryId}/status`, { status: 'done', lines });
      set((state) => ({
        deliveries: state.deliveries.map(d => d.id === deliveryId ? { ...d, ...res.data.data, status: 'Delivered', id: res.data.data._id } : d)
      }));
      get().fetchInitialData();
    } catch (error) {
      console.error('Validate delivery failed', error);
    }
  },

  // Transfers
  addTransfer: async (transferData) => {
    try {
      const res = await api.post('/transfers', transferData);
      const newTrf = { ...res.data.data, id: res.data.data._id };
      set((state) => ({ transfers: [newTrf, ...state.transfers] }));
      return newTrf;
    } catch (error) {
      console.error('Add transfer failed', error);
      throw error;
    }
  },

  validateTransfer: async (transferId) => {
    try {
      const res = await api.patch(`/transfers/${transferId}/status`, { status: 'done' });
      set((state) => ({
        transfers: state.transfers.map(t => t.id === transferId ? { ...t, status: 'Done' } : t)
      }));
      get().fetchInitialData();
    } catch (error) {
      console.error('Validate transfer failed', error);
    }
  },

  // Adjustments
  addAdjustment: async (adjData) => {
    try {
      const res = await api.post('/adjustments', adjData);
      const newAdj = { ...res.data.data, id: res.data.data._id };
      set((state) => ({ adjustments: [newAdj, ...state.adjustments] }));
      return newAdj;
    } catch (error) {
      console.error('Add adjustment failed', error);
      throw error;
    }
  },

  addMoveHistory: (moveData) => set((state) => ({ moveHistory: [{...moveData, id: Date.now().toString()}, ...state.moveHistory] })),
  addLocationToWarehouse: (warehouseId, loc) => set((state) => ({ warehouses: state.warehouses.map(w => w.id === warehouseId ? { ...w, locations: [...(w.locations || []), loc] } : w) })),
}));
