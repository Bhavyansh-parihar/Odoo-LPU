const Product = require('../models/Product');

/**
 * Auto-generate a SKU: CAT-XXXX format
 * @param {string} categoryName
 */
const generateSKU = async (categoryName) => {
  const prefix = (categoryName || 'GEN').substring(0, 3).toUpperCase().replace(/\s/g, '');
  const count = await Product.countDocuments();
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${seq}`;
};

/**
 * Generate a sequential document number with a given prefix
 * @param {mongoose.Model} Model
 * @param {string} field - field name to check (e.g. 'receiptNo')
 * @param {string} prefix - e.g. 'REC', 'DEL', 'TRF', 'ADJ'
 */
const generateDocNo = async (Model, field, prefix) => {
  const count = await Model.countDocuments();
  const seq = String(count + 1).padStart(5, '0');
  return `${prefix}-${seq}`;
};

/**
 * Build pagination metadata
 */
const paginate = (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

module.exports = { generateSKU, generateDocNo, paginate };
