/**
 * StockSense Database Seeder
 * Seeds 3 warehouses with realistic, distinct inventory data stored in MongoDB.
 * Run with: node src/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User          = require('./models/User');
const Category      = require('./models/Category');
const Product       = require('./models/Product');
const Warehouse     = require('./models/Warehouse');
const StockLevel    = require('./models/StockLevel');
const StockLedger   = require('./models/StockLedger');
const Receipt       = require('./models/Receipt');
const DeliveryOrder = require('./models/DeliveryOrder');
const InternalTransfer = require('./models/InternalTransfer');
const StockAdjustment  = require('./models/StockAdjustment');
const bcrypt = require('bcrypt');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ── Clear existing data ──────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany(), Category.deleteMany(), Product.deleteMany(),
    Warehouse.deleteMany(), StockLevel.deleteMany(), StockLedger.deleteMany(),
    Receipt.deleteMany(), DeliveryOrder.deleteMany(),
    InternalTransfer.deleteMany(), StockAdjustment.deleteMany()
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Categories ───────────────────────────────────────────────────────────
  const [catElec, catOffice, catRaw, catPkg, catFG] = await Category.insertMany([
    { name: 'Electronics & Components',  description: 'Microcontrollers, sensors, cables & gadgets' },
    { name: 'Office Furniture & Supplies', description: 'Desks, ergonomic chairs & stationaries' },
    { name: 'Raw Materials & Hardware',  description: 'Steel tubes, aluminum sheets, fasteners' },
    { name: 'Packaging & Shipping',      description: 'Corrugated boxes, bubble wraps & tapes' },
    { name: 'Finished Goods',            description: 'Ready-to-ship consumer end products' }
  ]);
  console.log('📦 Categories seeded');

  // ── Warehouses ───────────────────────────────────────────────────────────
  const [whMain, whHub, whNorth] = await Warehouse.insertMany([
    {
      name: 'Main Logistics Warehouse',
      code: 'WH-MAIN',
      locations: ['WH/Stock', 'WH/Input', 'WH/Output', 'WH/Packing']
    },
    {
      name: 'North Regional Distribution Hub',
      code: 'WH-HUB',
      locations: ['HUB/Stock', 'HUB/Pick']
    },
    {
      name: 'Downtown Retail Depot',
      code: 'WH-NORTH',
      locations: ['NORTH/Store', 'NORTH/Backroom']
    }
  ]);
  console.log('🏭 Warehouses seeded');

  // ── Users ────────────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const [manager, staffHub, staffNorth] = await User.insertMany([
    { name: 'Alex Morgan',   email: 'alex@stocksense.io',  passwordHash: await bcrypt.hash('password123', salt), role: 'manager', assignedWarehouse: whMain._id },
    { name: 'Jordan Lee',    email: 'jordan@stocksense.io',passwordHash: await bcrypt.hash('password123', salt), role: 'staff', assignedWarehouse: whHub._id },
    { name: 'Taylor Swift',  email: 'taylor@stocksense.io',passwordHash: await bcrypt.hash('password123', salt), role: 'staff', assignedWarehouse: whNorth._id }
  ]);
  console.log('👤 Users seeded');

  // ── Products ─────────────────────────────────────────────────────────────
  const [pErgo, pKeyboard, pMonitor, pBox, pAlum, pCable] = await Product.insertMany([
    { name: 'ErgoDesk Pro 1800 Adjustable Desk',        sku: 'FURN-ED-1800',   category: catOffice._id, unitOfMeasure: 'pcs', reorderPoint: 15, reorderQty: 30, isActive: true },
    { name: 'Wireless Mechanical RGB Keyboard',          sku: 'ELEC-KB-WM90',  category: catElec._id,   unitOfMeasure: 'pcs', reorderPoint: 25, reorderQty: 50, isActive: true },
    { name: 'UltraSharp 27" 4K IPS Monitor',            sku: 'ELEC-MON-274K', category: catElec._id,   unitOfMeasure: 'pcs', reorderPoint: 15, reorderQty: 20, isActive: true },
    { name: 'Heavy-Duty Corrugated Shipping Box (Lg)',   sku: 'PKG-BX-HD03',   category: catPkg._id,    unitOfMeasure: 'box', reorderPoint: 100, reorderQty: 500, isActive: true },
    { name: 'Industrial Aluminum Alloy Sheet (3mm)',     sku: 'RAW-AL-3MM',    category: catRaw._id,    unitOfMeasure: 'm',   reorderPoint: 20, reorderQty: 50, isActive: true },
    { name: 'USB-C Braided Cable 2m (100W)',             sku: 'ELEC-CBL-UC2M', category: catElec._id,   unitOfMeasure: 'pcs', reorderPoint: 50, reorderQty: 200, isActive: true }
  ]);
  console.log('🛒 Products seeded');

  // ── Stock Levels (per product per warehouse) ──────────────────────────────
  // Each warehouse has intentionally different stock values
  const stockData = [
    // WH-MAIN (bulk / primary storage)
    { product: pErgo._id,     warehouse: whMain._id,  location: 'WH/Stock',      quantity: 30 },
    { product: pKeyboard._id, warehouse: whMain._id,  location: 'WH/Stock',      quantity: 85 },
    { product: pMonitor._id,  warehouse: whMain._id,  location: 'WH/Stock',      quantity: 5  },
    { product: pBox._id,      warehouse: whMain._id,  location: 'WH/Stock',      quantity: 0  },
    { product: pAlum._id,     warehouse: whMain._id,  location: 'WH/Stock',      quantity: 12 },
    { product: pCable._id,    warehouse: whMain._id,  location: 'WH/Stock',      quantity: 200},

    // WH-HUB (regional distribution - mid-range quantities)
    { product: pErgo._id,     warehouse: whHub._id,   location: 'HUB/Stock',     quantity: 10 },
    { product: pKeyboard._id, warehouse: whHub._id,   location: 'HUB/Stock',     quantity: 25 },
    { product: pMonitor._id,  warehouse: whHub._id,   location: 'HUB/Stock',     quantity: 3  },
    { product: pBox._id,      warehouse: whHub._id,   location: 'HUB/Stock',     quantity: 0  },
    { product: pAlum._id,     warehouse: whHub._id,   location: 'HUB/Pick',      quantity: 6  },
    { product: pCable._id,    warehouse: whHub._id,   location: 'HUB/Stock',     quantity: 100},

    // WH-NORTH (retail depot - smaller, consumer-facing quantities)
    { product: pErgo._id,     warehouse: whNorth._id, location: 'NORTH/Store',   quantity: 5  },
    { product: pKeyboard._id, warehouse: whNorth._id, location: 'NORTH/Store',   quantity: 10 },
    { product: pMonitor._id,  warehouse: whNorth._id, location: 'NORTH/Backroom',quantity: 0  },
    { product: pCable._id,    warehouse: whNorth._id, location: 'NORTH/Store',   quantity: 40 }
  ];

  const insertedStockLevels = await StockLevel.insertMany(stockData);
  console.log('📊 Stock levels seeded');

  // ── Stock Ledger (opening entries for audit trail) ────────────────────────
  const ledgerEntries = insertedStockLevels
    .filter(sl => sl.quantity > 0)
    .map(sl => ({
      product:      sl.product,
      warehouse:    sl.warehouse,
      location:     sl.location,
      change:       sl.quantity,
      resultingQty: sl.quantity,
      sourceType:   'receipt',
      sourceId:     new mongoose.Types.ObjectId(), // placeholder opening entry
      createdAt:    new Date('2026-09-01')
    }));
  await StockLedger.insertMany(ledgerEntries);
  console.log('📒 Stock ledger seeded (opening balances)');

  // ── Receipts ─────────────────────────────────────────────────────────────
  await Receipt.insertMany([
    {
      receiptNo:    'REC-00001',
      supplierName: 'TechSupply Global Co.',
      warehouse:    whMain._id,
      status:       'ready',
      createdBy:    manager._id,
      lines: [
        { product: pMonitor._id,  expectedQty: 20, receivedQty: 0 },
        { product: pCable._id,    expectedQty: 150, receivedQty: 0 }
      ]
    },
    {
      receiptNo:    'REC-00002',
      supplierName: 'Apex Packaging Industries',
      warehouse:    whMain._id,
      status:       'draft',
      createdBy:    staffHub._id,
      lines: [
        { product: pBox._id, expectedQty: 500, receivedQty: 0 }
      ]
    },
    {
      receiptNo:    'REC-00003',
      supplierName: 'ErgoDesign Furnishings LLC',
      warehouse:    whMain._id,
      status:       'done',
      validatedAt:  new Date('2026-09-20'),
      createdBy:    manager._id,
      lines: [
        { product: pErgo._id, expectedQty: 25, receivedQty: 25 }
      ]
    },
    // WH-HUB specific receipt
    {
      receiptNo:    'REC-00004',
      supplierName: 'Primo Metals & Alloys',
      warehouse:    whHub._id,
      status:       'done',
      validatedAt:  new Date('2026-09-18'),
      createdBy:    manager._id,
      lines: [
        { product: pAlum._id, expectedQty: 20, receivedQty: 20 }
      ]
    },
    // WH-NORTH specific receipt
    {
      receiptNo:    'REC-00005',
      supplierName: 'Consumer Electronics Ltd.',
      warehouse:    whNorth._id,
      status:       'waiting',
      createdBy:    staffNorth._id,
      lines: [
        { product: pKeyboard._id, expectedQty: 30, receivedQty: 0 },
        { product: pCable._id,    expectedQty: 60, receivedQty: 0 }
      ]
    }
  ]);
  console.log('📥 Receipts seeded');

  // ── Delivery Orders ───────────────────────────────────────────────────────
  await DeliveryOrder.insertMany([
    {
      deliveryNo:   'DEL-00001',
      customerName: 'Starlight Solutions Inc.',
      warehouse:    whMain._id,
      status:       'draft',
      createdBy:    manager._id,
      lines: [
        { product: pErgo._id,     orderedQty: 5,  pickedQty: 0 },
        { product: pKeyboard._id, orderedQty: 10, pickedQty: 0 }
      ]
    },
    {
      deliveryNo:   'DEL-00002',
      customerName: 'Nexus Digital Labs',
      warehouse:    whMain._id,
      status:       'ready',
      createdBy:    staffHub._id,
      lines: [
        { product: pMonitor._id, orderedQty: 2, pickedQty: 2 }
      ]
    },
    {
      deliveryNo:   'DEL-00003',
      customerName: 'CyberTech Logistics',
      warehouse:    whHub._id,
      status:       'done',
      validatedAt:  new Date('2026-09-18'),
      createdBy:    manager._id,
      lines: [
        { product: pCable._id, orderedQty: 50, pickedQty: 50 }
      ]
    },
    // WH-NORTH specific delivery
    {
      deliveryNo:   'DEL-00004',
      customerName: 'Downtown Corporate Office',
      warehouse:    whNorth._id,
      status:       'draft',
      createdBy:    staffHub._id,
      lines: [
        { product: pErgo._id,     orderedQty: 2, pickedQty: 0 },
        { product: pKeyboard._id, orderedQty: 5, pickedQty: 0 }
      ]
    }
  ]);
  console.log('📤 Deliveries seeded');

  // ── Internal Transfers ────────────────────────────────────────────────────
  await InternalTransfer.insertMany([
    {
      transferNo:   'TRF-00001',
      product:      pKeyboard._id,
      quantity:     15,
      fromWarehouse: whMain._id,  fromLocation: 'WH/Stock',
      toWarehouse:   whNorth._id, toLocation:   'NORTH/Store',
      status:       'draft',
      createdBy:    manager._id
    },
    {
      transferNo:   'TRF-00002',
      product:      pErgo._id,
      quantity:     10,
      fromWarehouse: whHub._id,  fromLocation: 'HUB/Stock',
      toWarehouse:   whMain._id, toLocation:   'WH/Stock',
      status:       'done',
      createdBy:    manager._id
    },
    {
      transferNo:   'TRF-00003',
      product:      pCable._id,
      quantity:     30,
      fromWarehouse: whMain._id, fromLocation: 'WH/Stock',
      toWarehouse:   whNorth._id, toLocation:  'NORTH/Store',
      status:       'draft',
      createdBy:    staffHub._id
    }
  ]);
  console.log('🔄 Internal transfers seeded');

  // ── Stock Adjustments ─────────────────────────────────────────────────────
  await StockAdjustment.insertMany([
    {
      product:    pMonitor._id,
      warehouse:  whMain._id,
      location:   'WH/Stock',
      systemQty:  10,
      countedQty: 8,
      difference: -2,
      reason:     'Damaged during forklift pallet shift',
      createdBy:  manager._id,
      createdAt:  new Date('2026-09-23')
    },
    {
      product:    pAlum._id,
      warehouse:  whHub._id,
      location:   'HUB/Pick',
      systemQty:  15,
      countedQty: 18,
      difference: 3,
      reason:     'Annual physical stock audit mismatch reconciliation',
      createdBy:  staffHub._id,
      createdAt:  new Date('2026-09-26')
    }
  ]);
  console.log('⚖️  Stock adjustments seeded');

  console.log('\n🎉 Database seeding complete!');
  console.log('──────────────────────────────────');
  console.log('Warehouses : WH-MAIN | WH-HUB | WH-NORTH');
  console.log('Products   : 6');
  console.log('Categories : 5');
  console.log('Users      : 3');
  console.log('  - alex@stocksense.io   (WH-MAIN)  | password123');
  console.log('  - jordan@stocksense.io (WH-HUB)   | password123');
  console.log('  - taylor@stocksense.io (WH-NORTH) | password123');
  console.log('──────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
