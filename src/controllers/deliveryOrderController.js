const DeliveryOrder = require('../models/DeliveryOrder');
const mongoose = require('mongoose');
const { applyStockChange } = require('../services/stockService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getDeliveryOrders = async (req, res, next) => {
  try {
    const { status, warehouse, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (warehouse) query.warehouse = warehouse;

    const deliveryOrders = await DeliveryOrder.find(query)
      .populate('warehouse', 'name code')
      .populate('lines.product', 'name sku')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DeliveryOrder.countDocuments(query);

    return successResponse(res, { deliveryOrders, total, page: parseInt(page), limit: parseInt(limit) }, 'Delivery Orders fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.getDeliveryOrder = async (req, res, next) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id)
      .populate('warehouse', 'name code')
      .populate('lines.product', 'name sku');
    
    if (!order) {
      return errorResponse(res, 'Delivery Order not found', [], 404);
    }
    
    return successResponse(res, order, 'Delivery Order fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createDeliveryOrder = async (req, res, next) => {
  try {
    const { customerName, warehouse, lines } = req.body;
    
    const count = await DeliveryOrder.countDocuments();
    const deliveryNo = `DEL-${(count + 1).toString().padStart(5, '0')}`;

    const order = new DeliveryOrder({
      deliveryNo,
      customerName,
      warehouse,
      lines,
      status: 'draft',
      createdBy: req.user._id
    });

    await order.save();
    return successResponse(res, order, 'Delivery Order created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateDeliveryOrderStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status, lines } = req.body;
    const order = await DeliveryOrder.findById(req.params.id).session(session);

    if (!order) {
      throw { statusCode: 404, message: 'Delivery Order not found' };
    }

    if (order.status === 'done') {
      throw { statusCode: 400, message: 'Delivery Order is already done and cannot be modified' };
    }

    if (lines) {
      order.lines = order.lines.map(existingLine => {
        const matchingLine = lines.find(l => l.product.toString() === existingLine.product.toString());
        if (matchingLine) {
          existingLine.pickedQty = matchingLine.pickedQty;
        }
        return existingLine;
      });
    }

    order.status = status;

    if (status === 'done') {
      order.validatedAt = new Date();

      for (const line of order.lines) {
        if (line.pickedQty === undefined || line.pickedQty === null) {
           throw { statusCode: 400, message: `pickedQty is required for product ${line.product} when marking as done` };
        }
      }

      for (const line of order.lines) {
        try {
          // Negative change for delivery
          await applyStockChange({
            product: line.product,
            warehouse: order.warehouse,
            location: 'Default',
            change: -Math.abs(line.pickedQty),
            sourceType: 'delivery',
            sourceId: order._id
          }, session);
        } catch (error) {
           if (error.message.includes('negative') || error.message.includes('below zero')) {
             throw { statusCode: 409, message: `Insufficient stock for product ${line.product}` };
           }
           throw error;
        }
      }
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return successResponse(res, order, 'Delivery Order status updated');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

exports.deleteDeliveryOrder = async (req, res, next) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id);
    if (!order) {
      return errorResponse(res, 'Delivery Order not found', [], 404);
    }
    if (order.status !== 'draft') {
      return errorResponse(res, 'Only draft delivery orders can be deleted', [], 400);
    }

    await DeliveryOrder.findByIdAndDelete(req.params.id);
    return successResponse(res, {}, 'Delivery Order deleted successfully');
  } catch (err) {
    next(err);
  }
};
