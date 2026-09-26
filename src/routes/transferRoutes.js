const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', transferController.getTransfers);
router.post('/', authorize('manager', 'staff'), transferController.createTransfer);
router.patch('/:id/status', authorize('manager', 'staff'), transferController.updateTransferStatus);

module.exports = router;
