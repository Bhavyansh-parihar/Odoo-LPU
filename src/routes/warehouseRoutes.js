const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', warehouseController.getWarehouses);
router.post('/', authorize('manager'), warehouseController.createWarehouse);
router.put('/:id', authorize('manager'), warehouseController.updateWarehouse);
router.delete('/:id', authorize('manager'), warehouseController.deleteWarehouse);

module.exports = router;
