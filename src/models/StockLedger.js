const mongoose = require('mongoose');

const StockLedgerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location: { type: String },
  change: { type: Number, required: true },
  resultingQty: { type: Number, required: true },
  sourceType: { type: String, enum: ['receipt', 'delivery', 'transfer', 'adjustment'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

StockLedgerSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('StockLedger', StockLedgerSchema);
