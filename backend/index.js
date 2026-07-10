const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cabinRoutes = require('./routes/cabinRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Import error handler
const { errorHandler, handleValidationError, handleDuplicateFieldsError, handleCastError } = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Check if origin matches localhost, vercel.app domains, or the configured FRONTEND_URL
    const isLocal = /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    const isVercel = /\.vercel\.app$/.test(origin);
    const isFrontendUrl = process.env.FRONTEND_URL && (origin === process.env.FRONTEND_URL || origin === process.env.FRONTEND_URL.replace(/\/$/, ''));
    
    if (isLocal || isVercel || isFrontendUrl) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy mismatch'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI or MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cabins API' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cabins', cabinRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/bookings', bookingRoutes);

// Handle 404 routes - must be after all other routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Handle specific MongoDB errors
  if (err.name === 'ValidationError') err = handleValidationError(err);
  if (err.code === 11000) err = handleDuplicateFieldsError(err);
  if (err.name === 'CastError') err = handleCastError(err);

  errorHandler(err, req, res, next);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

