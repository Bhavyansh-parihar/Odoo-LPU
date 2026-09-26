const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    return successResponse(res, { categories }, 'Categories fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    const existing = await Category.findOne({ name });
    if (existing) {
      return errorResponse(res, 'Category name already exists', [], 409);
    }

    const category = await Category.create({ name, description });
    return successResponse(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
};
