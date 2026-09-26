const StockLevel = require('../models/StockLevel');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const DeliveryOrder = require('../models/DeliveryOrder');
const InternalTransfer = require('../models/InternalTransfer');

// @route   GET /api/dashboard
// @desc    Aggregated KPIs for the dashboard
exports.getKPIs = async (req, res) => {
  try {
    const [
      totalProducts,
      totalWarehouses,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers,
      recentLedger
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      require('../models/Warehouse').countDocuments(),
      Receipt.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } }),
      DeliveryOrder.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } }),
      InternalTransfer.countDocuments({ status: 'draft' }),
      StockLedger.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('product', 'name sku')
        .populate('warehouse', 'name code')
    ]);

    // Low stock products
    const products = await Product.find({ isActive: true, reorderPoint: { $gt: 0 } });
    let lowStockCount = 0;
    for (const p of products) {
      const levels = await StockLevel.find({ product: p._id });
      const total = levels.reduce((s, l) => s + l.quantity, 0);
      if (total <= p.reorderPoint) lowStockCount++;
    }

    // Total stock value (sum of all quantities across all products/warehouses)
    const stockAgg = await StockLevel.aggregate([
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
    ]);
    const totalStockQty = stockAgg.length ? stockAgg[0].totalQty : 0;

    res.json({
      kpis: {
        totalProducts,
        totalWarehouses,
        pendingReceipts,
        pendingDeliveries,
        pendingTransfers,
        lowStockCount,
        totalStockQty
      },
      recentActivity: recentLedger
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/dashboard/stock-levels
// @desc    All current stock levels
exports.getStockLevels = async (req, res) => {
  try {
    const { warehouse, product } = req.query;
    const filter = {};
    if (warehouse) filter.warehouse = warehouse;
    if (product) filter.product = product;

    const levels = await StockLevel.find(filter)
      .populate('product', 'name sku unitOfMeasure reorderPoint')
      .populate('warehouse', 'name code');

    res.json(levels);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/dashboard/ledger
// @desc    Stock ledger with filtering
exports.getLedger = async (req, res) => {
  try {
    const { product, sourceType, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (product) filter.product = product;
    if (sourceType) filter.sourceType = sourceType;

    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      StockLedger.find(filter)
        .populate('product', 'name sku')
        .populate('warehouse', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockLedger.countDocuments(filter)
    ]);

    res.json({ entries, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
