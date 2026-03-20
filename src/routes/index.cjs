const express = require('express');
const router = express.Router();

// Import the specific route handlers with their correct .cjs extension
const applicationRouter = require('./applications.cjs');
const uploadRouter = require('./upload.cjs');
const adminRouter = require('./admin.cjs');

// Use the routers
router.use('/applications', applicationRouter);
router.use('/upload', uploadRouter);
router.use('/admin', adminRouter);

module.exports = router;