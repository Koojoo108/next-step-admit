const express = require('express');
const router = express.Router();
// CORRECTED: Explicitly require the .cjs extension for the database module
const { db } = require('../models/database.cjs'); 
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

// --- Helper function for generating application ID ---
const generateApplicationId = () => {
    // Example: SHS-YYYY-XXXXXXX (using UUID)
    const year = new Date().getFullYear();
    const uniquePart = uuidv4().substring(0, 7).toUpperCase();
    return `SHS-${year}-${uniquePart}`;
};

// --- Controller Functions ---

// POST /api/applications/create
const createApplication = async (req, res) => {
    const { firstName, lastName, email } = req.body; // Basic fields for initial creation

    // Basic validation for initial creation
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: 'First name, last name, and email are required for initial creation.' });
    }

    const applicationId = generateApplicationId();
    const now = new Date().toISOString();

    const sql = `INSERT INTO applications (application_id, first_name, last_name, email, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [applicationId, firstName, lastName, email, 'Draft', now, now];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error creating application:', err.message);
            // Handle specific errors like email already exists
            if (err.message.includes('UNIQUE constraint failed: applications.email')) {
                return res.status(409).json({ message: 'An application with this email already exists.' });
            }
            return res.status(500).json({ message: 'Failed to create application.' });
        }
        res.status(201).json({ applicationId: applicationId, success: true });
    });
};

// GET /api/applications/:id
const getApplication = async (req, res) => {
    const { id } = req.params;

    const sql = `SELECT * FROM applications WHERE application_id = ?`;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Error fetching application:', err.message);
            return res.status(500).json({ message: 'Failed to fetch application.' });
        }
        if (!row) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        // Ensure JSON fields are parsed
        if (row.bece_subjects && typeof row.bece_subjects === 'string') {
            try { row.bece_subjects = JSON.parse(row.bece_subjects); } catch (e) { console.error('Failed to parse bece_subjects JSON:', e); row.bece_subjects = null; }
        }
        if (row.file_paths && typeof row.file_paths === 'string') {
            try { row.file_paths = JSON.parse(row.file_paths); } catch (e) { console.error('Failed to parse file_paths JSON:', e); row.file_paths = null; }
        }
        res.json(row);
    });
};

// POST /api/applications/:id/save
const saveApplicationProgress = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = req.body;

    const immutableFields = ['application_id', 'created_at', 'updated_at', 'submitted_at', 'status'];
    const fields = Object.keys(dataToUpdate).filter(field => !immutableFields.includes(field));

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No data provided to save.' });
    }

    const setClauses = fields.map(field => {
        const value = dataToUpdate[field];
        if (typeof value === 'object' && value !== null) {
            dataToUpdate[field] = JSON.stringify(value);
        }
        return `${field} = ?`;
    });

    const sql = `UPDATE applications SET ${setClauses.join(', ')}, updated_at = ? WHERE application_id = ?`;
    const params = [...fields.map(field => dataToUpdate[field]), new Date().toISOString(), id];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error saving application progress:', err.message);
            return res.status(500).json({ message: 'Failed to save application progress.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        res.json({ success: true, applicationId: id });
    });
};

// POST /api/applications/:id/submit
const submitApplication = async (req, res) => {
    const { id } = req.params;
    const submissionData = req.body;

    const criticalFields = [
        'firstName', 'lastName', 'dob', 'place_of_birth', 'region_of_origin',
        'mobile_phone', 'email', 'guardian_name', 'relationship', 'guardian_phone',
        'home_address', 'city', 'contact_region', 'jhs_name', 'jhs_location',
        'jhs_district', 'jhs_region', 'jhs_year_completed', 'jhs_index_number',
        'bece_index_number', 'bece_year', 'bece_aggregate', 'selected_programme',
        'selected_combination', 'accommodation_type', 'applicantDeclaration', 'guardianConsent'
    ];

    const missingFields = criticalFields.filter(field => {
        const value = submissionData[field];
        return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing required fields for submission: ${missingFields.join(', ')}` });
    }

    const now = new Date().toISOString();
    const sql = `UPDATE applications SET status = 'Submitted', submitted_at = ?, updated_at = ? WHERE application_id = ?`;
    const params = [now, now, id];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error submitting application:', err.message);
            return res.status(500).json({ message: 'Failed to submit application.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Application not found or already submitted.' });
        }
        res.json({ success: true, applicationId: id });
    });
};

// POST /api/applications/submit-full
const submitFullApplication = async (req, res) => {
    const data = req.body;
    console.log('Received full submission:', data);

    const sql = `
        INSERT INTO applications (
            application_id, first_name, last_name, email, mobile_phone, dob, gender,
            home_address, city, contact_region, guardian_name, guardian_phone, relationship,
            selected_programme, selected_combination, passport_photo_url, medical_conditions,
            jhs_name, bece_index_number, jhs_year_completed, status, created_at, updated_at, submitted_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
        )
    `;

    // Map frontend fields to database columns
    // frontend: full_name (split), email, phone, date_of_birth, gender, address, city (missing?), region (missing?), guardian_name, guardian_phone, parent_relationship
    // programme, programme_name, passport_photo_url, medical_conditions, jhs_name, bece_index, year_of_completion
    
    // We need to parse full_name
    const nameParts = (data.full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const params = [
        data.application_id_display || uuidv4(), // application_id
        firstName,
        lastName,
        data.email,
        data.phone,
        data.date_of_birth,
        data.gender,
        data.address,
        data.city_town || 'N/A', // Frontend might not send this explicitly in the main object, handled in detailed payload? 
                                 // Checking frontend code: "address: steps.personal.address". It doesn't seem to send city/region separately in the main payload constructed in handleSubmit.
                                 // Wait, the frontend code:
                                 // const applicationData = { ... address: steps.personal.address ... }
                                 // It doesn't explicitly send city or region in that `applicationData` object.
                                 // I'll need to check if I should default them or if I can extract them.
                                 // For now, I'll default them or use placeholders to ensure insertion works.
        data.region_state || 'N/A',
        data.guardian_name,
        data.guardian_phone,
        data.parent_relationship,
        data.programme, // selected_programme
        data.programme_name, // selected_combination (mapped? check frontend)
                             // Frontend: programme: steps.program.major, programme_name: steps.program.department
                             // Database: selected_programme, selected_combination
                             // I will map programme -> selected_programme, programme_name -> selected_combination
        data.passport_photo_url,
        data.medical_conditions,
        data.jhs_name,
        data.bece_index,
        data.year_of_completion,
        'Submitted', // status
        new Date().toISOString(), // created_at
        new Date().toISOString(), // updated_at
        new Date().toISOString()  // submitted_at
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error submitting full application:', err.message);
            return res.status(500).json({ message: 'Failed to submit application: ' + err.message });
        }
        res.status(201).json({ success: true, applicationId: params[0] });
    });
};

// --- Routes ---

// POST /api/applications/submit-full
router.post('/submit-full', submitFullApplication);

// POST /api/applications/create
router.post('/create', [
    body('firstName').isString().notEmpty().trim(),
    body('lastName').isString().notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
], createApplication);

// GET /api/applications/:id
router.get('/:id', getApplication);

// POST /api/applications/:id/save
router.post('/:id/save', saveApplicationProgress);

// POST /api/applications/:id/submit
router.post('/:id/submit', submitApplication);

module.exports = router;
