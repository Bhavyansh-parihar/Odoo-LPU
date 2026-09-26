const mongoose = require('mongoose');

const DeliveryOrderSchema = new mongoose.Schema({
  deliveryNo: { type: String, required: true, unique: true },
  customerName: String,
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  lines: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    orderedQty: { type: Number, required: true },
    pickedQty: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('DeliveryOrder', DeliveryOrderSchema);
