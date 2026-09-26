const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/stock', productController.getProductStock);

router.post('/', authorize('manager'), productController.createProduct);
router.put('/:id', authorize('manager'), productController.updateProduct);
router.delete('/:id', authorize('manager'), productController.deleteProduct);

module.exports = router;
