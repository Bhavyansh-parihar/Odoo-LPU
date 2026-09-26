const Product = require('../models/Product');
const StockLevel = require('../models/StockLevel');
const Receipt = require('../models/Receipt');
const DeliveryOrder = require('../models/DeliveryOrder');
const InternalTransfer = require('../models/InternalTransfer');
const Warehouse = require('../models/Warehouse');
const Category = require('../models/Category');
const { successResponse } = require('../utils/apiResponse');

exports.getKPIs = async (req, res, next) => {
  try {
    // Total products in stock (unique products that have qty > 0)
    const stockLevels = await StockLevel.find({ quantity: { $gt: 0 } });
    const uniqueProductsInStock = new Set(stockLevels.map(sl => sl.product.toString()));
    const totalProductsInStock = uniqueProductsInStock.size;

    // Fetch products to check reorder points
    const products = await Product.find({ isActive: true });
    
    // Group stock by product across all locations/warehouses
    const stockByProduct = {};
    for (const sl of stockLevels) {
      const pid = sl.product.toString();
      stockByProduct[pid] = (stockByProduct[pid] || 0) + sl.quantity;
    }

    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const product of products) {
      const pid = product._id.toString();
      const currentQty = stockByProduct[pid] || 0;
      
      if (currentQty === 0) {
        outOfStockCount++;
      } else if (currentQty <= (product.reorderPoint || 0)) {
        lowStockCount++;
      }
    }

    // Pending receipts (not done and not canceled)
    const pendingReceipts = await Receipt.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } });
    
    // Pending deliveries
    const pendingDeliveries = await DeliveryOrder.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } });
    
    // Scheduled transfers (draft)
    const scheduledTransfers = await InternalTransfer.countDocuments({ status: 'draft' });

    return successResponse(res, {
      totalProductsInStock,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers
    }, 'KPIs fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.getFilters = async (req, res, next) => {
  try {
    const documentTypes = ['Receipt', 'DeliveryOrder', 'InternalTransfer', 'StockAdjustment'];
    const statuses = ['draft', 'waiting', 'ready', 'done', 'canceled'];
    
    const warehouses = await Warehouse.find().select('name code locations');
    const categories = await Category.find().select('name description');

    return successResponse(res, {
      documentTypes,
      statuses,
      warehouses,
      categories
    }, 'Filters fetched successfully');
  } catch (err) {
    next(err);
  }
};
