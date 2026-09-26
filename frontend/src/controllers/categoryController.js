const Category = require('../models/Category');

// @route   GET /api/categories
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/categories
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ msg: 'Name is required' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ msg: 'Category already exists' });

    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT /api/categories/:id
exports.update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   DELETE /api/categories/:id
exports.remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json({ msg: 'Category removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
