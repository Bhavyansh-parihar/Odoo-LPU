const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', ledgerController.getLedger);

module.exports = router;
