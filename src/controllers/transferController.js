const InternalTransfer = require('../models/InternalTransfer');
const mongoose = require('mongoose');
const { applyStockChange } = require('../services/stockService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getTransfers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const transfers = await InternalTransfer.find(query)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('product', 'name sku')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await InternalTransfer.countDocuments(query);

    return successResponse(res, { transfers, total, page: parseInt(page), limit: parseInt(limit) }, 'Transfers fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const { product, quantity, from, to } = req.body;
    
    const count = await InternalTransfer.countDocuments();
    const transferNo = `TRF-${(count + 1).toString().padStart(5, '0')}`;

    const transfer = new InternalTransfer({
      transferNo,
      product,
      quantity,
      fromWarehouse: from.warehouse,
      fromLocation: from.location,
      toWarehouse: to.warehouse,
      toLocation: to.location,
      status: 'draft',
      createdBy: req.user._id
    });

    await transfer.save();
    return successResponse(res, transfer, 'Transfer created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateTransferStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status } = req.body;
    const transfer = await InternalTransfer.findById(req.params.id).session(session);

    if (!transfer) {
      throw { statusCode: 404, message: 'Transfer not found' };
    }

    if (transfer.status === 'done') {
      throw { statusCode: 400, message: 'Transfer is already done and cannot be modified' };
    }

    transfer.status = status;

    if (status === 'done') {
      try {
        // Decrease from source
        await applyStockChange({
          product: transfer.product,
          warehouse: transfer.fromWarehouse,
          location: transfer.fromLocation,
          change: -Math.abs(transfer.quantity),
          sourceType: 'transfer',
          sourceId: transfer._id
        }, session);

        // Increase to destination
        await applyStockChange({
          product: transfer.product,
          warehouse: transfer.toWarehouse,
          location: transfer.toLocation,
          change: Math.abs(transfer.quantity),
          sourceType: 'transfer',
          sourceId: transfer._id
        }, session);
      } catch (error) {
         if (error.message.includes('negative') || error.message.includes('below zero')) {
           throw { statusCode: 409, message: `Insufficient stock at source warehouse/location` };
         }
         throw error;
      }
    }

    await transfer.save({ session });
    await session.commitTransaction();
    session.endSession();

    return successResponse(res, transfer, 'Transfer status updated');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
