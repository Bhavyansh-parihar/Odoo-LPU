const successResponse = (res, data = {}, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message })
  });
};

const errorResponse = (res, message = 'An error occurred', errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  errorResponse
};
