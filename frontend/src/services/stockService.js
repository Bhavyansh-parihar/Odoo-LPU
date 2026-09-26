const mongoose = require('mongoose');
const StockLevel = require('../models/StockLevel');
const StockLedger = require('../models/StockLedger');

/**
 * Applies a stock change and logs it in the ledger using a transaction.
 * @param {Object} params - The stock change parameters
 * @param {mongoose.ClientSession} session - The active mongoose session
 */
const applyStockChange = async ({ product, warehouse, location, change, sourceType, sourceId }, session) => {
  if (!change || change === 0) return;

  const locString = location || "";

  // 1. Find or create the stock level record
  let stock = await StockLevel.findOne({ product, warehouse, location: locString }).session(session);
  
  let newQuantity = change;
  if (stock) {
    newQuantity = stock.quantity + change;
    stock.quantity = newQuantity;
    await stock.save({ session });
  } else {
    if (change < 0) {
      throw new Error('Cannot reduce stock below zero for an item with no existing stock level.');
    }
    stock = new StockLevel({
      product, warehouse, location: locString, quantity: newQuantity
    });
    await stock.save({ session });
  }

  if (stock.quantity < 0) {
    throw new Error('Stock cannot go negative.');
  }

  // 2. Create the ledger entry
  const ledgerEntry = new StockLedger({
    product,
    warehouse,
    location: locString,
    change,
    resultingQty: newQuantity,
    sourceType,
    sourceId
  });

  await ledgerEntry.save({ session });

  return stock;
};

module.exports = {
  applyStockChange
};
