const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, ctrl.getKPIs);
router.get('/stock-levels', auth, ctrl.getStockLevels);
router.get('/ledger', auth, ctrl.getLedger);

module.exports = router;
