const User = require('../models/User');
const bcrypt = require('bcrypt');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -otp');
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }
    return successResponse(res, user, 'Profile fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return errorResponse(res, 'Email already in use', [], 409);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    
    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.otp;

    return successResponse(res, userObj, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect current password', [], 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    return successResponse(res, {}, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};
