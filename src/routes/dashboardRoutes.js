const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/kpis', dashboardController.getKPIs);
router.get('/filters', dashboardController.getFilters);

module.exports = router;
