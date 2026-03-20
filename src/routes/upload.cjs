const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// CORRECTED: Explicitly require the .cjs extension for the database module
const { db } = require('../models/database.cjs'); 

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the uploads directory exists
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename using a combination of fieldname, timestamp, and random string
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        // Provide a specific error message for file type
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and PDF are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadFields = upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'beceResult', maxCount: 1 },
    { name: 'birthCert', maxCount: 1 },
    { name: 'nationalId', maxCount: 1 }
]);

// --- Controller Function for Uploads ---
const handleUpload = async (req, res) => {
    // applicationId is expected in the request body
    const { applicationId } = req.body;

    if (!applicationId) {
        return res.status(400).json({ message: 'Application ID is required for file upload.' });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files were uploaded.' });
    }

    // Fetch current file_paths from the database
    const getSql = `SELECT file_paths FROM applications WHERE application_id = ?`;
    db.get(getSql, [applicationId], async (err, row) => {
        if (err) {
            console.error('Error fetching application for file upload:', err.message);
            return res.status(500).json({ message: 'Failed to fetch application data for upload.' });
        }
        if (!row) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Parse existing file_paths JSON or initialize if null/empty
        let existingFilePaths = {};
        try {
            if (row.file_paths) {
                existingFilePaths = JSON.parse(row.file_paths);
            }
        } catch (parseErr) {
            console.error('Error parsing existing file_paths JSON:', parseErr);
            existingFilePaths = {};
        }

        const uploadedFiles = req.files;
        const updatedFilePaths = { ...existingFilePaths };
        const now = new Date().toISOString();

        // Process each uploaded file
        for (const fieldname in uploadedFiles) {
            if (uploadedFiles[fieldname] && uploadedFiles[fieldname].length > 0) {
                const file = uploadedFiles[fieldname][0];
                // Construct the URL for the uploaded file
                updatedFilePaths[fieldname] = `/uploads/${file.filename}`;
            }
        }

        // Update the database with the new file_paths and updated_at
        const updateSql = `UPDATE applications SET file_paths = ?, updated_at = ? WHERE application_id = ?`;
        const params = [JSON.stringify(updatedFilePaths), now, applicationId];

        db.run(updateSql, params, function(err) {
            if (err) {
                console.error('Error updating application with file paths:', err.message);
                return res.status(500).json({ message: 'Failed to save uploaded file information.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Application not found during file path update.' });
            }

            // Respond with details of the uploaded files
            const responseFiles = {};
            for (const fieldname in uploadedFiles) {
                if (uploadedFiles[fieldname] && uploadedFiles[fieldname].length > 0) {
                    const file = uploadedFiles[fieldname][0];
                    responseFiles[fieldname] = {
                        filename: file.filename,
                        url: `/uploads/${file.filename}`,
                    };
                }
            }

            res.status(200).json({
                message: 'Files uploaded and linked successfully!',
                filePaths: updatedFilePaths, // Send back the complete updated paths object
                uploaded: responseFiles // Send back details of just the newly uploaded files
            });
        });
    });
};

// --- Routes ---

// @route   POST /api/upload
// @desc    Handle file uploads
// Use .fields() to accept multiple files based on expected field names
router.post('/', uploadFields, handleUpload);

// Error handling for Multer and other potential errors during upload
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer specific errors (e.g., file size limit exceeded)
        return res.status(400).json({ message: err.message });
    } else if (err instanceof Error) {
        // Other errors (e.g., custom error from fileFilter)
        return res.status(400).json({ message: err.message });
    } else if (err) {
        // Generic server error
        console.error('Upload error:', err);
        return res.status(500).json({ message: 'An unexpected error occurred during upload.' });
    }
    next(); // Pass to the next middleware if no error
});

module.exports = router;
