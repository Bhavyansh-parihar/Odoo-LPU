const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  locations: [String]
});

module.exports = mongoose.model('Warehouse', WarehouseSchema);
