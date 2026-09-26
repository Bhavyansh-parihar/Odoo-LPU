const Warehouse = require('../models/Warehouse');

// @route   GET /api/warehouses
exports.getAll = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/warehouses/:id
exports.getOne = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ msg: 'Warehouse not found' });
    res.json(warehouse);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/warehouses
exports.create = async (req, res) => {
  try {
    const { name, code, locations } = req.body;
    if (!name || !code) return res.status(400).json({ msg: 'Name and code are required' });

    const warehouse = new Warehouse({ name, code, locations: locations || [] });
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT /api/warehouses/:id
exports.update = async (req, res) => {
  try {
    const { name, code, locations } = req.body;
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { name, code, locations },
      { new: true, runValidators: true }
    );
    if (!warehouse) return res.status(404).json({ msg: 'Warehouse not found' });
    res.json(warehouse);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   DELETE /api/warehouses/:id
exports.remove = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ msg: 'Warehouse not found' });
    res.json({ msg: 'Warehouse removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
