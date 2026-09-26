const mongoose = require('mongoose');
const StockAdjustment = require('../models/StockAdjustment');
const StockLevel = require('../models/StockLevel');
const { applyStockChange } = require('../services/stockService');

// @route   GET /api/adjustments
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [adjustments, total] = await Promise.all([
      StockAdjustment.find()
        .populate('product', 'name sku unitOfMeasure')
        .populate('warehouse', 'name code')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockAdjustment.countDocuments()
    ]);

    res.json({ adjustments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/adjustments
// @desc    Apply a stock count adjustment immediately
exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { product, warehouse, location, countedQty, reason } = req.body;
    if (!product || !warehouse || countedQty === undefined) {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'product, warehouse, and countedQty are required' });
    }

    // Get current system quantity
    const stockLevel = await StockLevel.findOne({
      product,
      warehouse,
      location: location || ''
    }).session(session);

    const systemQty = stockLevel ? stockLevel.quantity : 0;
    const difference = countedQty - systemQty;

    if (difference === 0) {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'No difference detected; adjustment not needed' });
    }

    const adjustment = new StockAdjustment({
      product,
      warehouse,
      location: location || '',
      systemQty,
      countedQty,
      difference,
      reason,
      createdBy: req.user.id
    });
    await adjustment.save({ session });

    // Apply the difference to stock
    await applyStockChange({
      product,
      warehouse,
      location: location || '',
      change: difference,
      sourceType: 'adjustment',
      sourceId: adjustment._id
    }, session);

    await session.commitTransaction();
    res.status(201).json(adjustment);
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  } finally {
    session.endSession();
  }
};
