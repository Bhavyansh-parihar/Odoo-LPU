const Receipt = require('../models/Receipt');
const mongoose = require('mongoose');
const { applyStockChange } = require('../services/stockService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getReceipts = async (req, res, next) => {
  try {
    const { status, warehouse, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (warehouse) query.warehouse = warehouse;

    const receipts = await Receipt.find(query)
      .populate('warehouse', 'name code')
      .populate('lines.product', 'name sku')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Receipt.countDocuments(query);

    return successResponse(res, { receipts, total, page: parseInt(page), limit: parseInt(limit) }, 'Receipts fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.getReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('warehouse', 'name code')
      .populate('lines.product', 'name sku');
    
    if (!receipt) {
      return errorResponse(res, 'Receipt not found', [], 404);
    }
    
    return successResponse(res, receipt, 'Receipt fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createReceipt = async (req, res, next) => {
  try {
    const { supplierName, warehouse, lines } = req.body;
    
    const count = await Receipt.countDocuments();
    const receiptNo = `REC-${(count + 1).toString().padStart(5, '0')}`;

    const receipt = new Receipt({
      receiptNo,
      supplierName,
      warehouse,
      lines,
      status: 'draft',
      createdBy: req.user._id
    });

    await receipt.save();
    return successResponse(res, receipt, 'Receipt created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return errorResponse(res, 'Receipt not found', [], 404);
    }
    if (receipt.status !== 'draft') {
      return errorResponse(res, 'Only draft receipts can be updated entirely', [], 400);
    }

    const updated = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return successResponse(res, updated, 'Receipt updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.updateReceiptStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status, lines } = req.body;
    const receipt = await Receipt.findById(req.params.id).session(session);

    if (!receipt) {
      throw { statusCode: 404, message: 'Receipt not found' };
    }

    if (receipt.status === 'done') {
      throw { statusCode: 400, message: 'Receipt is already done and cannot be modified' };
    }

    // Update lines if provided
    if (lines) {
      receipt.lines = receipt.lines.map(existingLine => {
        const matchingLine = lines.find(l => l.product.toString() === existingLine.product.toString());
        if (matchingLine) {
          existingLine.receivedQty = matchingLine.receivedQty;
        }
        return existingLine;
      });
    }

    receipt.status = status;

    if (status === 'done') {
      receipt.validatedAt = new Date();

      // Ensure all lines have receivedQty before finalizing
      for (const line of receipt.lines) {
        if (line.receivedQty === undefined || line.receivedQty === null) {
           throw { statusCode: 400, message: `receivedQty is required for product ${line.product} when marking as done` };
        }
      }

      // Atomically apply stock change
      for (const line of receipt.lines) {
        await applyStockChange({
          product: line.product,
          warehouse: receipt.warehouse,
          location: 'Default',
          change: line.receivedQty,
          sourceType: 'receipt',
          sourceId: receipt._id
        }, session);
      }
    }

    await receipt.save({ session });
    await session.commitTransaction();
    session.endSession();

    return successResponse(res, receipt, 'Receipt status updated');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

exports.deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return errorResponse(res, 'Receipt not found', [], 404);
    }
    if (receipt.status !== 'draft') {
      return errorResponse(res, 'Only draft receipts can be deleted', [], 400);
    }

    await Receipt.findByIdAndDelete(req.params.id);
    return successResponse(res, {}, 'Receipt deleted successfully');
  } catch (err) {
    next(err);
  }
};
