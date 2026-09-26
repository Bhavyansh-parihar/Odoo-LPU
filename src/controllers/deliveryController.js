const mongoose = require('mongoose');
const DeliveryOrder = require('../models/DeliveryOrder');
const StockLevel = require('../models/StockLevel');
const { generateDocNo } = require('../utils/helpers');
const { applyStockChange } = require('../services/stockService');

// @route   GET /api/deliveries
exports.getAll = async (req, res) => {
  try {
    const { status, warehouse, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (warehouse) filter.warehouse = warehouse;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      DeliveryOrder.find(filter)
        .populate('warehouse', 'name code')
        .populate('createdBy', 'name email')
        .populate('lines.product', 'name sku unitOfMeasure')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DeliveryOrder.countDocuments(filter)
    ]);

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/deliveries/:id
exports.getOne = async (req, res) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id)
      .populate('warehouse', 'name code')
      .populate('createdBy', 'name email')
      .populate('lines.product', 'name sku unitOfMeasure');
    if (!order) return res.status(404).json({ msg: 'Delivery order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/deliveries
exports.create = async (req, res) => {
  try {
    const { customerName, warehouse, lines } = req.body;
    if (!warehouse || !lines || lines.length === 0) {
      return res.status(400).json({ msg: 'Warehouse and at least one line item are required' });
    }

    const deliveryNo = await generateDocNo(DeliveryOrder, 'deliveryNo', 'DEL');
    const order = new DeliveryOrder({
      deliveryNo,
      customerName,
      warehouse,
      lines,
      createdBy: req.user.id,
      status: 'draft'
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT /api/deliveries/:id
exports.update = async (req, res) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Delivery order not found' });
    if (['done', 'canceled'].includes(order.status)) {
      return res.status(400).json({ msg: 'Cannot edit a completed or canceled order' });
    }

    const { customerName, warehouse, lines, status } = req.body;
    if (customerName !== undefined) order.customerName = customerName;
    if (warehouse) order.warehouse = warehouse;
    if (lines) order.lines = lines;
    if (status && status !== 'done') order.status = status;

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/deliveries/:id/validate
exports.validate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await DeliveryOrder.findById(req.params.id).session(session);
    if (!order) { await session.abortTransaction(); return res.status(404).json({ msg: 'Delivery order not found' }); }
    if (order.status === 'done') { await session.abortTransaction(); return res.status(400).json({ msg: 'Order already validated' }); }
    if (order.status === 'canceled') { await session.abortTransaction(); return res.status(400).json({ msg: 'Order is canceled' }); }

    // Check availability and apply stock deductions
    for (const line of order.lines) {
      const qty = line.pickedQty > 0 ? line.pickedQty : line.orderedQty;
      const stockLevel = await StockLevel.findOne({
        product: line.product,
        warehouse: order.warehouse
      }).session(session);

      if (!stockLevel || stockLevel.quantity < qty) {
        await session.abortTransaction();
        return res.status(400).json({ msg: `Insufficient stock for product ${line.product}` });
      }

      await applyStockChange({
        product: line.product,
        warehouse: order.warehouse,
        location: req.body.location || '',
        change: -qty,
        sourceType: 'delivery',
        sourceId: order._id
      }, session);
    }

    order.status = 'done';
    order.validatedAt = new Date();
    await order.save({ session });

    await session.commitTransaction();
    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  } finally {
    session.endSession();
  }
};

// @route   POST /api/deliveries/:id/cancel
exports.cancel = async (req, res) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Delivery order not found' });
    if (order.status === 'done') return res.status(400).json({ msg: 'Cannot cancel a validated order' });

    order.status = 'canceled';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
