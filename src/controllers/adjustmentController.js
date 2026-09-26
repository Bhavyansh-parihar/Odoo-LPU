const StockAdjustment = require('../models/StockAdjustment');
const StockLevel = require('../models/StockLevel');
const mongoose = require('mongoose');
const { applyStockChange } = require('../services/stockService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getAdjustments = async (req, res, next) => {
  try {
    const { warehouse, product, page = 1, limit = 20 } = req.query;
    const query = {};

    if (warehouse) query.warehouse = warehouse;
    if (product) query.product = product;

    const adjustments = await StockAdjustment.find(query)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await StockAdjustment.countDocuments(query);

    return successResponse(res, { adjustments, total, page: parseInt(page), limit: parseInt(limit) }, 'Adjustments fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createAdjustment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { product, warehouse, location, countedQty, reason } = req.body;
    
    // Find current stock
    const stock = await StockLevel.findOne({ product, warehouse, location }).session(session);
    const systemQty = stock ? stock.quantity : 0;
    
    const difference = countedQty - systemQty;

    const adjustment = new StockAdjustment({
      product,
      warehouse,
      location,
      systemQty,
      countedQty,
      difference,
      reason,
      createdBy: req.user._id
    });

    await adjustment.save({ session });

    await applyStockChange({
      product,
      warehouse,
      location,
      change: difference,
      sourceType: 'adjustment',
      sourceId: adjustment._id
    }, session);

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, adjustment, 'Adjustment created successfully', 201);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
