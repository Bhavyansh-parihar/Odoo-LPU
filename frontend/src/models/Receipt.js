const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
  receiptNo: { type: String, required: true, unique: true },
  supplierName: String,
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  lines: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    expectedQty: { type: Number, required: true },
    receivedQty: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Receipt', ReceiptSchema);
