const mongoose = require('mongoose');

const StockAdjustmentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location: String,
  systemQty: { type: Number, required: true },
  countedQty: { type: Number, required: true },
  difference: { type: Number, required: true },
  reason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('StockAdjustment', StockAdjustmentSchema);
