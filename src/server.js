const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize database connection
const { db, closeDatabase } = require('./models/database'); // Import DB module

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now; restrict in production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' })); // Increase limit for file uploads if needed
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase limit for file uploads if needed

// Serve static files from the public directory (including admission.html)
app.use(express.static(path.join(__dirname, '../public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
// Import and use routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Handle specific errors like database errors or validation errors
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Optionally include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  closeDatabase();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  closeDatabase();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

module.exports = app; // Export for testing
