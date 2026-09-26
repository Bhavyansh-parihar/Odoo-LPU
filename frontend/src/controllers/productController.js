const Product = require('../models/Product');
const Category = require('../models/Category');
const StockLevel = require('../models/StockLevel');
const { generateSKU } = require('../utils/helpers');

// @route   GET /api/products
exports.getAll = async (req, res) => {
  try {
    const { search, category, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/products/:id
exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    // Also grab current stock levels across all warehouses
    const stockLevels = await StockLevel.find({ product: product._id })
      .populate('warehouse', 'name code');

    res.json({ product, stockLevels });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST /api/products
exports.create = async (req, res) => {
  try {
    const { name, sku, category, unitOfMeasure, reorderPoint, reorderQty } = req.body;
    if (!name || !unitOfMeasure) {
      return res.status(400).json({ msg: 'Name and unitOfMeasure are required' });
    }

    // Auto-generate SKU if not provided
    let finalSKU = sku;
    if (!finalSKU) {
      const cat = category ? await Category.findById(category) : null;
      finalSKU = await generateSKU(cat ? cat.name : 'GEN');
    }

    const product = new Product({
      name,
      sku: finalSKU,
      category: category || null,
      unitOfMeasure,
      reorderPoint: reorderPoint || 0,
      reorderQty: reorderQty || 0
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'SKU already exists' });
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT /api/products/:id
exports.update = async (req, res) => {
  try {
    const { name, sku, category, unitOfMeasure, reorderPoint, reorderQty, isActive } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, sku, category, unitOfMeasure, reorderPoint, reorderQty, isActive },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'SKU already exists' });
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   DELETE /api/products/:id  (soft delete)
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deactivated', product });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET /api/products/low-stock
exports.getLowStock = async (req, res) => {
  try {
    // Find all active products with a reorderPoint set
    const products = await Product.find({ isActive: true, reorderPoint: { $gt: 0 } }).populate('category', 'name');

    const lowStockItems = [];
    for (const product of products) {
      const levels = await StockLevel.find({ product: product._id }).populate('warehouse', 'name code');
      const totalQty = levels.reduce((sum, l) => sum + l.quantity, 0);
      if (totalQty <= product.reorderPoint) {
        lowStockItems.push({ product, totalQty, levels });
      }
    }

    res.json(lowStockItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
