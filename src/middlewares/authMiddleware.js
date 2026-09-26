const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized to access this route', [], 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!req.user) {
      return errorResponse(res, 'User not found', [], 401);
    }
    
    next();
  } catch (err) {
    return errorResponse(res, 'Not authorized to access this route', [], 401);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authorized to access this route', [], 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'User role is not authorized to access this route', [], 403);
    }
    next();
  };
};
