const mongoose = require('mongoose');
const InternalTransfer = require('../models/InternalTransfer');
const StockLevel = require('../models/StockLevel');
const { generateDocNo } = require('../utils/helpers');
const { applyStockChange } = require('../services/stockService');

// @route   GET /api/transfers
exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [transfers, total] = await Promise.all([
      InternalTransfer.find(filter)
        .populate('product', 'name sku unitOfMeasure')
        .populate('fromWarehouse', 'name code')
        .populate('toWarehouse', 'name code')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InternalTransfer.countDocuments(filter)
    ]);

    res.json({ transfers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/transfers/:id
exports.getOne = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findById(req.params.id)
      .populate('product', 'name sku unitOfMeasure')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('createdBy', 'name email');
    if (!transfer) return res.status(404).json({ msg: 'Transfer not found' });
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/transfers
exports.create = async (req, res) => {
  try {
    const { product, quantity, fromWarehouse, fromLocation, toWarehouse, toLocation } = req.body;
    if (!product || !quantity || !fromWarehouse || !toWarehouse) {
      return res.status(400).json({ msg: 'product, quantity, fromWarehouse, toWarehouse are required' });
    }

    const transferNo = await generateDocNo(InternalTransfer, 'transferNo', 'TRF');
    const transfer = new InternalTransfer({
      transferNo,
      product,
      quantity,
      fromWarehouse,
      fromLocation: fromLocation || '',
      toWarehouse,
      toLocation: toLocation || '',
      createdBy: req.user.id,
      status: 'draft'
    });

    await transfer.save();
    res.status(201).json(transfer);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/transfers/:id/validate
exports.validate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transfer = await InternalTransfer.findById(req.params.id).session(session);
    if (!transfer) { await session.abortTransaction(); return res.status(404).json({ msg: 'Transfer not found' }); }
    if (transfer.status === 'done') { await session.abortTransaction(); return res.status(400).json({ msg: 'Transfer already done' }); }
    if (transfer.status === 'canceled') { await session.abortTransaction(); return res.status(400).json({ msg: 'Transfer is canceled' }); }

    // Check source stock availability
    const srcStock = await StockLevel.findOne({
      product: transfer.product,
      warehouse: transfer.fromWarehouse
    }).session(session);

    if (!srcStock || srcStock.quantity < transfer.quantity) {
      await session.abortTransaction();
      return res.status(400).json({ msg: 'Insufficient stock at source location' });
    }

    // Deduct from source
    await applyStockChange({
      product: transfer.product,
      warehouse: transfer.fromWarehouse,
      location: transfer.fromLocation,
      change: -transfer.quantity,
      sourceType: 'transfer',
      sourceId: transfer._id
    }, session);

    // Add to destination
    await applyStockChange({
      product: transfer.product,
      warehouse: transfer.toWarehouse,
      location: transfer.toLocation,
      change: transfer.quantity,
      sourceType: 'transfer',
      sourceId: transfer._id
    }, session);

    transfer.status = 'done';
    await transfer.save({ session });

    await session.commitTransaction();
    res.json(transfer);
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  } finally {
    session.endSession();
  }
};

// @route   POST /api/transfers/:id/cancel
exports.cancel = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ msg: 'Transfer not found' });
    if (transfer.status === 'done') return res.status(400).json({ msg: 'Cannot cancel a completed transfer' });

    transfer.status = 'canceled';
    await transfer.save();
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
