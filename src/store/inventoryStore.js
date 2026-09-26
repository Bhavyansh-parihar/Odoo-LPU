import { create } from 'zustand';
import {
  initialProducts,
  initialCategories,
  initialUnitsOfMeasure,
  initialWarehouses,
  initialReceipts,
  initialDeliveries,
  initialTransfers,
  initialAdjustments,
  initialMoveHistory
} from '../data/mockData';

export const useInventoryStore = create((set, get) => ({
  products: initialProducts,
  categories: initialCategories,
  unitsOfMeasure: initialUnitsOfMeasure,
  warehouses: initialWarehouses,
  receipts: initialReceipts,
  deliveries: initialDeliveries,
  transfers: initialTransfers,
  adjustments: initialAdjustments,
  moveHistory: initialMoveHistory,

  // Products CRUD
  addProduct: (productData) => {
    const newProduct = {
      id: `prd-${Date.now()}`,
      totalStock: Number(productData.initialStock) || 0,
      minStock: Number(productData.minStock) || 10,
      reorderQty: Number(productData.reorderQty) || 20,
      costPrice: Number(productData.costPrice) || 0,
      salePrice: Number(productData.salePrice) || 0,
      description: productData.description || '',
      reorderRules: {
        minQty: Number(productData.minStock) || 10,
        maxQty: (Number(productData.minStock) || 10) + (Number(productData.reorderQty) || 20),
        autoTrigger: true
      },
      stockByLocation: [
        { locationId: 'loc-1', locationCode: 'WH/Stock', qty: Number(productData.initialStock) || 0 }
      ],
      ...productData
    };

    set((state) => ({
      products: [newProduct, ...state.products]
    }));

    // Record initial stock move if initial stock > 0
    if (newProduct.totalStock > 0) {
      get().addMoveHistory({
        reference: `INIT/${newProduct.sku}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        contact: 'System Initialization',
        source: 'Inventory Setup',
        destination: 'WH/Stock',
        product: newProduct.name,
        quantity: newProduct.totalStock,
        status: 'Done'
      });
    }

    return newProduct;
  },

  updateProduct: (id, updatedData) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedData } : p
      )
    }));
  },

  updateReorderRules: (productId, rules) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, reorderRules: { ...p.reorderRules, ...rules } } : p
      )
    }));
  },

  addCategory: (categoryData) => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...categoryData
    };
    set((state) => ({
      categories: [...state.categories, newCategory]
    }));
  },

  // Receipts
  addReceipt: (receiptData) => {
    const newRef = `WH/IN/${String(get().receipts.length + 1).padStart(5, '0')}`;
    const newReceipt = {
      id: `rec-${Date.now()}`,
      reference: newRef,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      status: 'Dispatched',
      items: receiptData.items.map(item => {
        const prod = get().products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Unknown Product',
          qtyExpected: Number(item.qtyExpected),
          qtyReceived: 0
        };
      }),
      ...receiptData
    };

    set((state) => ({
      receipts: [newReceipt, ...state.receipts]
    }));
    return newReceipt;
  },

  validateReceipt: (receiptId) => {
    const receipt = get().receipts.find(r => r.id === receiptId);
    if (!receipt || receipt.status === 'Done') return;

    // Mark items received and update stock
    const updatedItems = receipt.items.map(item => ({
      ...item,
      qtyReceived: item.qtyExpected
    }));

    // Update product stock levels
    receipt.items.forEach(item => {
      const product = get().products.find(p => p.id === item.productId);
      if (product) {
        const newTotalStock = product.totalStock + item.qtyExpected;
        const updatedStockByLoc = product.stockByLocation.map(loc => 
          loc.locationCode === receipt.destinationLocation
            ? { ...loc, qty: loc.qty + item.qtyExpected }
            : loc
        );

        // If location was not found in stockByLocation, append it
        if (!updatedStockByLoc.some(loc => loc.locationCode === receipt.destinationLocation)) {
          updatedStockByLoc.push({
            locationId: `loc-dest-${Date.now()}`,
            locationCode: receipt.destinationLocation,
            qty: item.qtyExpected
          });
        }

        get().updateProduct(product.id, {
          totalStock: newTotalStock,
          stockByLocation: updatedStockByLoc
        });

        // Add to move history
        get().addMoveHistory({
          reference: receipt.reference,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          contact: receipt.supplier,
          source: 'Vendor/' + receipt.supplier,
          destination: receipt.destinationLocation,
          product: product.name,
          quantity: item.qtyExpected,
          status: 'Done'
        });
      }
    });

    set((state) => ({
      receipts: state.receipts.map(r => 
        r.id === receiptId ? { ...r, status: 'Done', items: updatedItems } : r
      )
    }));
  },

  // Deliveries
  addDelivery: (deliveryData) => {
    const newRef = `WH/OUT/${String(get().deliveries.length + 1).padStart(5, '0')}`;
    const newDelivery = {
      id: `del-${Date.now()}`,
      reference: newRef,
      date: deliveryData.date || new Date().toISOString().split('T')[0],
      status: 'Draft',
      items: deliveryData.items.map(item => {
        const prod = get().products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Unknown Product',
          qtyDemand: Number(item.qtyDemand),
          qtyDone: 0
        };
      }),
      ...deliveryData
    };

    set((state) => ({
      deliveries: [newDelivery, ...state.deliveries]
    }));
    return newDelivery;
  },

  updateDeliveryStatus: (deliveryId, status) => {
    set((state) => ({
      deliveries: state.deliveries.map(d => d.id === deliveryId ? { ...d, status } : d)
    }));
  },

  validateDelivery: (deliveryId) => {
    const delivery = get().deliveries.find(d => d.id === deliveryId);
    if (!delivery || delivery.status === 'Delivered') return;

    const updatedItems = delivery.items.map(item => ({
      ...item,
      qtyDone: item.qtyDemand
    }));

    delivery.items.forEach(item => {
      const product = get().products.find(p => p.id === item.productId);
      if (product) {
        const newTotalStock = Math.max(0, product.totalStock - item.qtyDemand);
        const updatedStockByLoc = product.stockByLocation.map(loc =>
          loc.locationCode === delivery.sourceLocation
            ? { ...loc, qty: Math.max(0, loc.qty - item.qtyDemand) }
            : loc
        );

        get().updateProduct(product.id, {
          totalStock: newTotalStock,
          stockByLocation: updatedStockByLoc
        });

        get().addMoveHistory({
          reference: delivery.reference,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          contact: delivery.customer,
          source: delivery.sourceLocation,
          destination: 'Customer/' + delivery.customer,
          product: product.name,
          quantity: item.qtyDemand,
          status: 'Done'
        });
      }
    });

    set((state) => ({
      deliveries: state.deliveries.map(d =>
        d.id === deliveryId ? { ...d, status: 'Delivered', items: updatedItems } : d
      )
    }));
  },

  // Internal Transfers
  addTransfer: (transferData) => {
    const newRef = `WH/INT/${String(get().transfers.length + 1).padStart(5, '0')}`;
    const newTransfer = {
      id: `trf-${Date.now()}`,
      reference: newRef,
      date: transferData.date || new Date().toISOString().split('T')[0],
      status: 'Ready',
      items: transferData.items.map(item => {
        const prod = get().products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Unknown Product',
          qty: Number(item.qty)
        };
      }),
      ...transferData
    };

    set((state) => ({
      transfers: [newTransfer, ...state.transfers]
    }));
    return newTransfer;
  },

  validateTransfer: (transferId) => {
    const transfer = get().transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status === 'Done') return;

    transfer.items.forEach(item => {
      const product = get().products.find(p => p.id === item.productId);
      if (product) {
        const updatedStockByLoc = product.stockByLocation.map(loc => {
          if (loc.locationCode === transfer.sourceLocation) {
            return { ...loc, qty: Math.max(0, loc.qty - item.qty) };
          }
          if (loc.locationCode === transfer.destinationLocation) {
            return { ...loc, qty: loc.qty + item.qty };
          }
          return loc;
        });

        if (!updatedStockByLoc.some(loc => loc.locationCode === transfer.destinationLocation)) {
          updatedStockByLoc.push({
            locationId: `loc-dest-${Date.now()}`,
            locationCode: transfer.destinationLocation,
            qty: item.qty
          });
        }

        get().updateProduct(product.id, {
          stockByLocation: updatedStockByLoc
        });

        get().addMoveHistory({
          reference: transfer.reference,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          contact: 'Internal Stock Transfer',
          source: transfer.sourceLocation,
          destination: transfer.destinationLocation,
          product: product.name,
          quantity: item.qty,
          status: 'Done'
        });
      }
    });

    set((state) => ({
      transfers: state.transfers.map(t =>
        t.id === transferId ? { ...t, status: 'Done' } : t
      )
    }));
  },

  // Inventory Adjustments
  addAdjustment: (adjData) => {
    const newRef = `WH/ADJ/${String(get().adjustments.length + 1).padStart(5, '0')}`;
    const product = get().products.find(p => p.id === adjData.productId);
    const recordedQty = Number(adjData.recordedQty);
    const countedQty = Number(adjData.countedQty);
    const adjustmentQty = countedQty - recordedQty;

    const newAdj = {
      id: `adj-${Date.now()}`,
      reference: newRef,
      date: new Date().toISOString().split('T')[0],
      location: adjData.location,
      productId: adjData.productId,
      productName: product ? product.name : 'Unknown Product',
      recordedQty,
      countedQty,
      adjustmentQty,
      reason: adjData.reason,
      status: 'Draft'
    };

    set((state) => ({
      adjustments: [newAdj, ...state.adjustments]
    }));
    return newAdj;
  },

  applyAdjustment: (adjId) => {
    const adj = get().adjustments.find(a => a.id === adjId);
    if (!adj || adj.status === 'Applied') return;

    const product = get().products.find(p => p.id === adj.productId);
    if (product) {
      const newTotalStock = Math.max(0, product.totalStock + adj.adjustmentQty);
      const updatedStockByLoc = product.stockByLocation.map(loc =>
        loc.locationCode === adj.location
          ? { ...loc, qty: Math.max(0, loc.qty + adj.adjustmentQty) }
          : loc
      );

      get().updateProduct(product.id, {
        totalStock: newTotalStock,
        stockByLocation: updatedStockByLoc
      });

      get().addMoveHistory({
        reference: adj.reference,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        contact: 'Inventory Auditor',
        source: adj.adjustmentQty >= 0 ? 'Adjustment Addition' : adj.location,
        destination: adj.adjustmentQty >= 0 ? adj.location : 'Inventory Shrinkage/Loss',
        product: product.name,
        quantity: adj.adjustmentQty,
        status: 'Done'
      });
    }

    set((state) => ({
      adjustments: state.adjustments.map(a =>
        a.id === adjId ? { ...a, status: 'Applied' } : a
      )
    }));
  },

  // Move History
  addMoveHistory: (moveRecord) => {
    const newMove = {
      id: `mov-${Date.now()}`,
      ...moveRecord
    };
    set((state) => ({
      moveHistory: [newMove, ...state.moveHistory]
    }));
  },

  // Warehouse management
  updateWarehouse: (whId, whData) => {
    set((state) => ({
      warehouses: state.warehouses.map(w => w.id === whId ? { ...w, ...whData } : w)
    }));
  },

  addLocationToWarehouse: (whId, locationData) => {
    set((state) => ({
      warehouses: state.warehouses.map(w => {
        if (w.id === whId) {
          const newLoc = {
            id: `loc-${Date.now()}`,
            ...locationData
          };
          return { ...w, locations: [...w.locations, newLoc] };
        }
        return w;
      })
    }));
  }
}));
