const express = require('express');
const router = express.Router();
const adjustmentController = require('../controllers/adjustmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', adjustmentController.getAdjustments);
router.post('/', authorize('manager', 'staff'), adjustmentController.createAdjustment);

module.exports = router;
