const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('StockSense API Running'));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/categories',  require('./routes/categoryRoutes'));
app.use('/api/products',    require('./routes/productRoutes'));
app.use('/api/warehouses',  require('./routes/warehouseRoutes'));
app.use('/api/receipts',    require('./routes/receiptRoutes'));
app.use('/api/deliveries',  require('./routes/deliveryRoutes'));
app.use('/api/transfers',   require('./routes/transferRoutes'));
app.use('/api/adjustments', require('./routes/adjustmentRoutes'));
app.use('/api/dashboard',   require('./routes/dashboardRoutes'));

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ msg: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StockSense server started on port ${PORT}`));
