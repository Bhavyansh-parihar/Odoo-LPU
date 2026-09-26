const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const { generateDocNo } = require('../utils/helpers');
const { applyStockChange } = require('../services/stockService');

// @route   GET /api/receipts
exports.getAll = async (req, res) => {
  try {
    const { status, warehouse, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (warehouse) filter.warehouse = warehouse;

    const skip = (page - 1) * limit;
    const [receipts, total] = await Promise.all([
      Receipt.find(filter)
        .populate('warehouse', 'name code')
        .populate('createdBy', 'name email')
        .populate('lines.product', 'name sku unitOfMeasure')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Receipt.countDocuments(filter)
    ]);

    res.json({ receipts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/receipts/:id
exports.getOne = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('warehouse', 'name code')
      .populate('createdBy', 'name email')
      .populate('lines.product', 'name sku unitOfMeasure');
    if (!receipt) return res.status(404).json({ msg: 'Receipt not found' });
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/receipts
exports.create = async (req, res) => {
  try {
    const { supplierName, warehouse, lines } = req.body;
    if (!warehouse || !lines || lines.length === 0) {
      return res.status(400).json({ msg: 'Warehouse and at least one line item are required' });
    }

    const receiptNo = await generateDocNo(Receipt, 'receiptNo', 'REC');
    const receipt = new Receipt({
      receiptNo,
      supplierName,
      warehouse,
      lines,
      createdBy: req.user.id,
      status: 'draft'
    });

    await receipt.save();
    res.status(201).json(receipt);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT /api/receipts/:id
exports.update = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ msg: 'Receipt not found' });
    if (['done', 'canceled'].includes(receipt.status)) {
      return res.status(400).json({ msg: 'Cannot edit a completed or canceled receipt' });
    }

    const { supplierName, warehouse, lines, status } = req.body;
    if (supplierName !== undefined) receipt.supplierName = supplierName;
    if (warehouse) receipt.warehouse = warehouse;
    if (lines) receipt.lines = lines;
    if (status && status !== 'done') receipt.status = status;

    await receipt.save();
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/receipts/:id/validate
// @desc    Validate receipt → set status to done, apply stock +
exports.validate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const receipt = await Receipt.findById(req.params.id).session(session);
    if (!receipt) { await session.abortTransaction(); return res.status(404).json({ msg: 'Receipt not found' }); }
    if (receipt.status === 'done') { await session.abortTransaction(); return res.status(400).json({ msg: 'Receipt already validated' }); }
    if (receipt.status === 'canceled') { await session.abortTransaction(); return res.status(400).json({ msg: 'Receipt is canceled' }); }

    // Apply stock changes for each line
    for (const line of receipt.lines) {
      const qty = line.receivedQty > 0 ? line.receivedQty : line.expectedQty;
      await applyStockChange({
        product: line.product,
        warehouse: receipt.warehouse,
        location: req.body.location || '',
        change: qty,
        sourceType: 'receipt',
        sourceId: receipt._id
      }, session);
    }

    receipt.status = 'done';
    receipt.validatedAt = new Date();
    await receipt.save({ session });

    await session.commitTransaction();
    res.json(receipt);
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  } finally {
    session.endSession();
  }
};

// @route   POST /api/receipts/:id/cancel
exports.cancel = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ msg: 'Receipt not found' });
    if (receipt.status === 'done') return res.status(400).json({ msg: 'Cannot cancel a validated receipt' });

    receipt.status = 'canceled';
    await receipt.save();
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
