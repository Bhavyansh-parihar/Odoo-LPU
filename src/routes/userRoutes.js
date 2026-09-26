const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('manager'));

router.get('/', userController.getUsers);
router.patch('/:id/role', userController.assignRole);

module.exports = router;
