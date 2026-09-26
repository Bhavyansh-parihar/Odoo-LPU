export const initialWarehouses = [
  {
    id: 'wh-1',
    code: 'WH-MAIN',
    name: 'Main Logistics Warehouse',
    address: '104 Industrial Parkway, Zone 4, Metro City',
    manager: 'Sarah Jenkins',
    phone: '+1 (555) 019-2834',
    locations: [
      { id: 'loc-1', code: 'WH/Stock', name: 'Main Inventory Stock', type: 'Internal' },
      { id: 'loc-2', code: 'WH/Input', name: 'Receiving Bay (Input)', type: 'Internal' },
      { id: 'loc-3', code: 'WH/Output', name: 'Shipping Bay (Output)', type: 'Internal' },
      { id: 'loc-4', code: 'WH/Packing', name: 'Packing & Staging Area', type: 'Internal' }
    ]
  },
  {
    id: 'wh-2',
    code: 'WH-HUB',
    name: 'North Regional Distribution Hub',
    address: '88 Logistics Blvd, Sector 12, Commerce City',
    manager: 'David Chen',
    phone: '+1 (555) 438-9901',
    locations: [
      { id: 'loc-5', code: 'HUB/Stock', name: 'Hub Primary Storage', type: 'Internal' },
      { id: 'loc-6', code: 'HUB/Pick', name: 'Fast-Move Pick Zone', type: 'Internal' }
    ]
  },
  {
    id: 'wh-3',
    code: 'WH-NORTH',
    name: 'Downtown Retail Depot',
    address: '12 Market Street, Downtown Central',
    manager: 'Elena Rostova',
    phone: '+1 (555) 872-3311',
    locations: [
      { id: 'loc-7', code: 'NORTH/Store', name: 'Retail Storefront Display', type: 'Internal' },
      { id: 'loc-8', code: 'NORTH/Backroom', name: 'Store Backroom Storage', type: 'Internal' }
    ]
  }
];

export const initialCategories = [
  { id: 'cat-1', name: 'Electronics & Components', code: 'ELEC', description: 'Microcontrollers, sensors, cables & gadgets' },
  { id: 'cat-2', name: 'Office Furniture & Supplies', code: 'OFFICE', description: 'Desks, ergonomic chairs & stationaries' },
  { id: 'cat-3', name: 'Raw Materials & Hardware', code: 'RAW', description: 'Steel tubes, aluminum sheets, fasteners' },
  { id: 'cat-4', name: 'Packaging & Shipping', code: 'PKG', description: 'Corrugated boxes, bubble wraps & tapes' },
  { id: 'cat-5', name: 'Finished Goods', code: 'FG', description: 'Ready-to-ship consumer end products' }
];

export const initialUnitsOfMeasure = ['pcs', 'kg', 'm', 'box', 'L', 'set', 'pack'];

export const initialProducts = [
  {
    id: 'prd-1',
    name: 'ErgoDesk Pro 1800 Adjustable Desk',
    sku: 'FURN-ED-1800',
    category: 'Office Furniture & Supplies',
    uom: 'pcs',
    totalStock: 45,
    minStock: 15,
    reorderQty: 30,
    costPrice: 280.00,
    salePrice: 499.00,
    description: 'Dual-motor electric height-adjustable standing desk frame with oak top.',
    reorderRules: {
      minQty: 15,
      maxQty: 60,
      autoTrigger: true
    },
    stockByLocation: [
      { locationId: 'loc-1', locationCode: 'WH/Stock', qty: 30 },
      { locationId: 'loc-5', locationCode: 'HUB/Stock', qty: 10 },
      { locationId: 'loc-7', locationCode: 'NORTH/Store', qty: 5 }
    ]
  },
  {
    id: 'prd-2',
    name: 'Wireless Mechanical RGB Keyboard',
    sku: 'ELEC-KB-WM90',
    category: 'Electronics & Components',
    uom: 'pcs',
    totalStock: 120,
    minStock: 25,
    reorderQty: 50,
    costPrice: 42.50,
    salePrice: 89.99,
    description: 'Hot-swappable tactile switch mechanical keyboard with Bluetooth 5.2.',
    reorderRules: {
      minQty: 25,
      maxQty: 150,
      autoTrigger: true
    },
    stockByLocation: [
      { locationId: 'loc-1', locationCode: 'WH/Stock', qty: 85 },
      { locationId: 'loc-5', locationCode: 'HUB/Stock', qty: 25 },
      { locationId: 'loc-7', locationCode: 'NORTH/Store', qty: 10 }
    ]
  },
  {
    id: 'prd-3',
    name: 'UltraSharp 27" 4K IPS Monitor',
    sku: 'ELEC-MON-274K',
    category: 'Electronics & Components',
    uom: 'pcs',
    totalStock: 8,
    minStock: 15,
    reorderQty: 20,
    costPrice: 240.00,
    salePrice: 389.00,
    description: 'Color calibrated USB-C hub monitor for professionals.',
    reorderRules: {
      minQty: 15,
      maxQty: 40,
      autoTrigger: true
    },
    stockByLocation: [
      { locationId: 'loc-1', locationCode: 'WH/Stock', qty: 5 },
      { locationId: 'loc-5', locationCode: 'HUB/Stock', qty: 3 },
      { locationId: 'loc-7', locationCode: 'NORTH/Store', qty: 0 }
    ]
  },
  {
    id: 'prd-4',
    name: 'Heavy-Duty Corrugated Shipping Box (Large)',
    sku: 'PKG-BX-HD03',
    category: 'Packaging & Shipping',
    uom: 'box',
    totalStock: 0,
    minStock: 100,
    reorderQty: 500,
    costPrice: 0.85,
    salePrice: 2.20,
    description: 'Double-walled protective transport box 60x40x40cm.',
    reorderRules: {
      minQty: 100,
      maxQty: 1000,
      autoTrigger: true
    },
    stockByLocation: [
      { locationId: 'loc-1', locationCode: 'WH/Stock', qty: 0 },
      { locationId: 'loc-5', locationCode: 'HUB/Stock', qty: 0 }
    ]
  },
  {
    id: 'prd-5',
    name: 'Industrial Aluminum Alloy Sheet (3mm)',
    sku: 'RAW-AL-3MM',
    category: 'Raw Materials & Hardware',
    uom: 'm',
    totalStock: 18,
    minStock: 20,
    reorderQty: 50,
    costPrice: 35.00,
    salePrice: 65.00,
    description: 'Grade 6061-T6 structural aluminum sheet metal.',
    reorderRules: {
      minQty: 20,
      maxQty: 100,
      autoTrigger: false
    },
    stockByLocation: [
      { locationId: 'loc-1', locationCode: 'WH/Stock', qty: 12 },
      { locationId: 'loc-5', locationCode: 'HUB/Stock', qty: 6 }
    ]
  },
  {
    id: 'prd-6',
    name: 'USB-C Braided Cable 2m (100W)',
    sku: 'ELEC-CBL-UC2M',
    category: 'Electronics & Components',
    uom: 'pcs',
    totalStock: 340,
    minStock: 50,
    reorderQty: 200,
    costPrice: 2.10,
    salePrice: 12.99,
    description: 'Nylon braided high-speed power delivery cable.',
    reorderRules: {
      minQty: 50,
      maxQty: 500,
      autoTrigger: true
    },
    stockByLocation: [
      { locationId: 'loc-1', locationCode: 'WH/Stock', qty: 200 },
      { locationId: 'loc-5', locationCode: 'HUB/Stock', qty: 100 },
      { locationId: 'loc-7', locationCode: 'NORTH/Store', qty: 40 }
    ]
  }
];

export const initialReceipts = [
  {
    id: 'rec-1',
    reference: 'WH/IN/00001',
    date: '2026-09-24',
    supplier: 'TechSupply Global Co.',
    destinationLocation: 'WH/Input',
    status: 'Arrived', // 'Dispatched', 'Arrived', 'Done', 'Cancelled'
    notes: 'PO-88219 Batch shipment for tech accessories.',
    items: [
      { productId: 'prd-3', productName: 'UltraSharp 27" 4K IPS Monitor', qtyExpected: 20, qtyReceived: 0 },
      { productId: 'prd-6', productName: 'USB-C Braided Cable 2m (100W)', qtyExpected: 150, qtyReceived: 0 }
    ]
  },
  {
    id: 'rec-2',
    reference: 'WH/IN/00002',
    date: '2026-09-22',
    supplier: 'Apex Packaging Industries',
    destinationLocation: 'WH/Input',
    status: 'Dispatched',
    notes: 'Urgent restocking for shipping boxes.',
    items: [
      { productId: 'prd-4', productName: 'Heavy-Duty Corrugated Shipping Box (Large)', qtyExpected: 500, qtyReceived: 0 }
    ]
  },
  {
    id: 'rec-3',
    reference: 'WH/IN/00000',
    date: '2026-09-20',
    supplier: 'ErgoDesign Furnishings LLC',
    destinationLocation: 'WH/Input',
    status: 'Done',
    notes: 'Completed receipt verified by warehouse clerk.',
    items: [
      { productId: 'prd-1', productName: 'ErgoDesk Pro 1800 Adjustable Desk', qtyExpected: 25, qtyReceived: 25 }
    ]
  }
];

export const initialDeliveries = [
  {
    id: 'del-1',
    reference: 'WH/OUT/00001',
    date: '2026-09-25',
    customer: 'Starlight Solutions Inc.',
    sourceLocation: 'WH/Stock',
    status: 'Draft', // 'Draft', 'Waiting', 'Picked', 'Packed', 'Done', 'Cancelled'
    notes: 'Corporate office setup order #SO-9921',
    items: [
      { productId: 'prd-1', productName: 'ErgoDesk Pro 1800 Adjustable Desk', qtyDemand: 5, qtyDone: 0 },
      { productId: 'prd-2', productName: 'Wireless Mechanical RGB Keyboard', qtyDemand: 10, qtyDone: 0 }
    ]
  },
  {
    id: 'del-2',
    reference: 'WH/OUT/00002',
    date: '2026-09-24',
    customer: 'Nexus Digital Labs',
    sourceLocation: 'WH/Stock',
    status: 'Picked',
    notes: 'Express courier delivery requested.',
    items: [
      { productId: 'prd-3', productName: 'UltraSharp 27" 4K IPS Monitor', qtyDemand: 2, qtyDone: 2 }
    ]
  },
  {
    id: 'del-3',
    reference: 'WH/OUT/00000',
    date: '2026-09-18',
    customer: 'CyberTech Logistics',
    sourceLocation: 'HUB/Stock',
    status: 'Delivered',
    notes: 'Fulfilled and dispatched via Freight truck #44.',
    items: [
      { productId: 'prd-6', productName: 'USB-C Braided Cable 2m (100W)', qtyDemand: 50, qtyDone: 50 }
    ]
  }
];

export const initialTransfers = [
  {
    id: 'trf-1',
    reference: 'WH/INT/00001',
    date: '2026-09-25',
    sourceLocation: 'WH/Stock',
    destinationLocation: 'NORTH/Store',
    status: 'Ready', // 'Draft', 'Ready', 'Done', 'Cancelled'
    notes: 'Storefront replenishment for weekend sale.',
    items: [
      { productId: 'prd-2', productName: 'Wireless Mechanical RGB Keyboard', qty: 15 },
      { productId: 'prd-6', productName: 'USB-C Braided Cable 2m (100W)', qty: 30 }
    ]
  },
  {
    id: 'trf-2',
    reference: 'WH/INT/00000',
    date: '2026-09-21',
    sourceLocation: 'HUB/Stock',
    destinationLocation: 'WH/Stock',
    status: 'Done',
    notes: 'Stock balancing between main warehouse and hub.',
    items: [
      { productId: 'prd-1', productName: 'ErgoDesk Pro 1800 Adjustable Desk', qty: 10 }
    ]
  }
];

export const initialAdjustments = [
  {
    id: 'adj-1',
    reference: 'WH/ADJ/00001',
    date: '2026-09-23',
    location: 'WH/Stock',
    productId: 'prd-3',
    productName: 'UltraSharp 27" 4K IPS Monitor',
    recordedQty: 10,
    countedQty: 8,
    adjustmentQty: -2,
    reason: 'Damaged during forklift pallet shift',
    status: 'Applied' // 'Draft', 'Applied'
  },
  {
    id: 'adj-2',
    reference: 'WH/ADJ/00002',
    date: '2026-09-26',
    location: 'HUB/Stock',
    productId: 'prd-5',
    productName: 'Industrial Aluminum Alloy Sheet (3mm)',
    recordedQty: 15,
    countedQty: 18,
    adjustmentQty: 3,
    reason: 'Annual physical stock audit mismatch reconciliation',
    status: 'Draft'
  }
];

export const initialMoveHistory = [
  {
    id: 'mov-1',
    reference: 'WH/IN/00000',
    date: '2026-09-20 14:32',
    contact: 'ErgoDesign Furnishings LLC',
    source: 'Vendors/External',
    destination: 'WH/Input',
    product: 'ErgoDesk Pro 1800 Adjustable Desk',
    quantity: 25,
    status: 'Done'
  },
  {
    id: 'mov-2',
    reference: 'WH/INT/00000',
    date: '2026-09-21 09:15',
    contact: 'Internal Warehouse Team',
    source: 'HUB/Stock',
    destination: 'WH/Stock',
    product: 'ErgoDesk Pro 1800 Adjustable Desk',
    quantity: 10,
    status: 'Done'
  },
  {
    id: 'mov-3',
    reference: 'WH/ADJ/00001',
    date: '2026-09-23 11:45',
    contact: 'Inventory Auditor',
    source: 'WH/Stock',
    destination: 'Inventory Loss/Adjustment',
    product: 'UltraSharp 27" 4K IPS Monitor',
    quantity: -2,
    status: 'Done'
  },
  {
    id: 'mov-4',
    reference: 'WH/OUT/00002',
    date: '2026-09-24 16:00',
    contact: 'Nexus Digital Labs',
    source: 'WH/Stock',
    destination: 'Customers/External',
    product: 'UltraSharp 27" 4K IPS Monitor',
    quantity: 2,
    status: 'Picked'
  },
  {
    id: 'mov-5',
    reference: 'WH/INT/00001',
    date: '2026-09-25 10:20',
    contact: 'Internal Store Transfer',
    source: 'WH/Stock',
    destination: 'NORTH/Store',
    product: 'Wireless Mechanical RGB Keyboard',
    quantity: 15,
    status: 'Pending'
  }
];

export const initialUserProfile = {
  id: 'usr-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@stocksense.io',
  role: 'Inventory Operations Manager',
  department: 'Supply Chain & Warehousing',
  avatar: null,
  phone: '+1 (555) 234-5678',
  assignedWarehouse: 'WH-MAIN (Main Logistics Warehouse)',
  joinedDate: '2024-03-15'
};
