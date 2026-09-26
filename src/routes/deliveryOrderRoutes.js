const express = require('express');
const router = express.Router();
const deliveryOrderController = require('../controllers/deliveryOrderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', deliveryOrderController.getDeliveryOrders);
router.get('/:id', deliveryOrderController.getDeliveryOrder);
router.post('/', authorize('manager', 'staff'), deliveryOrderController.createDeliveryOrder);
router.patch('/:id/status', authorize('manager', 'staff'), deliveryOrderController.updateDeliveryOrderStatus);
router.delete('/:id', authorize('manager', 'staff'), deliveryOrderController.deleteDeliveryOrder);

module.exports = router;
