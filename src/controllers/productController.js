const Product = require('../models/Product');
const Category = require('../models/Category');
const StockLevel = require('../models/StockLevel');
const { applyStockChange } = require('../services/stockService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const mongoose = require('mongoose');

exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('category', 'name description')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return successResponse(res, { products, total, page: parseInt(page), limit: parseInt(limit) }, 'Products fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description');
    if (!product || !product.isActive) {
      return errorResponse(res, 'Product not found', [], 404);
    }
    return successResponse(res, product, 'Product fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, sku, category, unitOfMeasure, reorderPoint, reorderQty, initialStock, warehouse } = req.body;

    const catExists = await Category.findById(category).session(session);
    if (!catExists) {
      throw { statusCode: 404, message: 'Category not found' };
    }

    let finalSku = sku;
    if (!finalSku) {
      const count = await Product.countDocuments().session(session);
      const prefix = catExists.name.substring(0, 3).toUpperCase();
      finalSku = `${prefix}-${(count + 1).toString().padStart(4, '0')}`;
    }

    const existingProduct = await Product.findOne({ sku: finalSku }).session(session);
    if (existingProduct) {
      throw { statusCode: 409, message: 'Product with this SKU already exists' };
    }

    const product = new Product({
      name,
      sku: finalSku,
      category,
      unitOfMeasure,
      reorderPoint,
      reorderQty
    });

    await product.save({ session });

    if (initialStock && initialStock > 0) {
      if (!warehouse) {
        throw { statusCode: 400, message: 'Warehouse is required to set initial stock' };
      }
      await applyStockChange({
        product: product._id,
        warehouse,
        location: 'Default',
        change: initialStock,
        sourceType: 'adjustment',
        sourceId: product._id
      }, session);
    }

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, product, 'Product created successfully', 201);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product || !product.isActive) {
      return errorResponse(res, 'Product not found', [], 404);
    }
    return successResponse(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return errorResponse(res, 'Product not found', [], 404);
    }
    product.isActive = false;
    await product.save();
    return successResponse(res, {}, 'Product deactivated');
  } catch (err) {
    next(err);
  }
};

exports.getProductStock = async (req, res, next) => {
  try {
    const stockLevels = await StockLevel.find({ product: req.params.id })
      .populate('warehouse', 'name code');
    return successResponse(res, { stockLevels }, 'Stock levels fetched successfully');
  } catch (err) {
    next(err);
  }
};
