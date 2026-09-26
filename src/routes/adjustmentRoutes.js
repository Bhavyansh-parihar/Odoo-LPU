const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adjustmentController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, ctrl.getAll);
router.post('/', auth, ctrl.create);

module.exports = router;
