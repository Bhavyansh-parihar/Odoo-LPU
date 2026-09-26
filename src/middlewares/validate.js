const { errorResponse } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return errorResponse(res, 'Validation Error', errors, 400);
  }
  req.body = value;
  next();
};

module.exports = validate;
