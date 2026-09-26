const StockLedger = require('../models/StockLedger');
const { successResponse } = require('../utils/apiResponse');

exports.getLedger = async (req, res, next) => {
  try {
    const { product, warehouse, sourceType, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const query = {};

    if (product) query.product = product;
    if (warehouse) query.warehouse = warehouse;
    if (sourceType) query.sourceType = sourceType;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const ledger = await StockLedger.find(query)
      .populate('warehouse', 'name code')
      .populate('product', 'name sku')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await StockLedger.countDocuments(query);

    return successResponse(res, { ledger, total, page: parseInt(page), limit: parseInt(limit) }, 'Ledger fetched successfully');
  } catch (err) {
    next(err);
  }
};
