const mongoose = require('mongoose');

const StockLevelSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location: { type: String },
  quantity: { type: Number, default: 0, required: true }
});

StockLevelSchema.index({ product: 1, warehouse: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('StockLevel', StockLevelSchema);
