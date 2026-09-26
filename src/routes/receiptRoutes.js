const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', receiptController.getReceipts);
router.get('/:id', receiptController.getReceipt);

// Managers and staff can create and validate receipts
router.post('/', authorize('manager', 'staff'), receiptController.createReceipt);
router.put('/:id', authorize('manager', 'staff'), receiptController.updateReceipt);
router.patch('/:id/status', authorize('manager', 'staff'), receiptController.updateReceiptStatus);
router.delete('/:id', authorize('manager', 'staff'), receiptController.deleteReceipt);

module.exports = router;
