const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', categoryController.getCategories);
router.post('/', authorize('manager'), categoryController.createCategory);

module.exports = router;
