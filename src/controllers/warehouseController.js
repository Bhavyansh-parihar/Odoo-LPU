const Warehouse = require('../models/Warehouse');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find();
    return successResponse(res, { warehouses }, 'Warehouses fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.createWarehouse = async (req, res, next) => {
  try {
    const { name, code, locations } = req.body;
    
    const existing = await Warehouse.findOne({ code });
    if (existing) {
      return errorResponse(res, 'Warehouse code already exists', [], 409);
    }

    const warehouse = await Warehouse.create({ name, code, locations });
    return successResponse(res, warehouse, 'Warehouse created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) {
      return errorResponse(res, 'Warehouse not found', [], 404);
    }
    return successResponse(res, warehouse, 'Warehouse updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      return errorResponse(res, 'Warehouse not found', [], 404);
    }
    return successResponse(res, {}, 'Warehouse deleted successfully');
  } catch (err) {
    next(err);
  }
};
