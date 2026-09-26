const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    return successResponse(res, users, 'Users fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.assignRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['manager', 'staff'].includes(role)) {
      return errorResponse(res, 'Invalid role', [], 400);
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }
    user.role = role;
    await user.save();
    return successResponse(res, user, 'Role assigned successfully');
  } catch (err) {
    next(err);
  }
};
