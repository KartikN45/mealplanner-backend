require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request: ${req.method} ${req.originalUrl} from ${req.headers.origin}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error(`[${new Date().toISOString()}] Error: MONGO_URI is not defined in .env`);
  process.exit(1);
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => console.log(`[${new Date().toISOString()}] MongoDB Connected Successfully`))
  .catch(err => {
    console.error(`[${new Date().toISOString()}] MongoDB Connection Error: ${err.message}\n${err.stack}`);
    process.exit(1);
  });

// Routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (err) {
  console.error(`[${new Date().toISOString()}] Error loading auth routes: ${err.message}\n${err.stack}`);
  process.exit(1);
}

// Handle unmatched routes
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`));
