const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

// Define API Routes
const apiVersion = '/api/v1';
app.use(`${apiVersion}/auth`, require('./routes/authRoutes'));
app.use(`${apiVersion}/products`, require('./routes/productRoutes'));
app.use(`${apiVersion}/categories`, require('./routes/categoryRoutes'));
app.use(`${apiVersion}/warehouses`, require('./routes/warehouseRoutes'));
app.use(`${apiVersion}/receipts`, require('./routes/receiptRoutes'));
app.use(`${apiVersion}/delivery-orders`, require('./routes/deliveryOrderRoutes'));
app.use(`${apiVersion}/transfers`, require('./routes/transferRoutes'));
app.use(`${apiVersion}/adjustments`, require('./routes/adjustmentRoutes'));
app.use(`${apiVersion}/ledger`, require('./routes/ledgerRoutes'));
app.use(`${apiVersion}/dashboard`, require('./routes/dashboardRoutes'));
app.use(`${apiVersion}/profile`, require('./routes/profileRoutes'));

// Serve Frontend Static Files if Built
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('StockSense API Running'));
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
