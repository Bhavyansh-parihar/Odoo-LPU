const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/deliveryController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, ctrl.getOne);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.post('/:id/validate', auth, ctrl.validate);
router.post('/:id/cancel', auth, ctrl.cancel);

module.exports = router;
