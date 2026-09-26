const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  let message = err.message || 'Server Error';
  let statusCode = err.statusCode || 500;
  let errors = err.errors || [];

  if (err.name === 'ValidationError') {
    message = 'Validation Error';
    statusCode = 400;
    errors = Object.values(err.errors).map(val => val.message);
  }

  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 409;
  }

  errorResponse(res, message, errors, statusCode);
};

module.exports = errorHandler;
