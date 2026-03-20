const express = require('express');
const router = express.Router();
const { db } = require('../models/database.cjs');

// 1. DASHBOARD STATS
router.get('/dashboard/stats', (req, res) => {
    const queries = {
        totalApplications: "SELECT COUNT(*) as count FROM applications",
        pendingReview: "SELECT COUNT(*) as count FROM applications WHERE status IN ('Submitted', 'Processing')",
        approvedApplications: "SELECT COUNT(*) as count FROM applications WHERE status = 'Admitted'",
        totalStudents: "SELECT COUNT(*) as count FROM applications WHERE status = 'Admitted'",
        recentActivity: "SELECT first_name, last_name, status, updated_at FROM applications ORDER BY updated_at DESC LIMIT 5"
    };

    const stats = {};
    const keys = Object.keys(queries);
    let completed = 0;

    keys.forEach(key => {
        db.get(queries[key], [], (err, row) => {
            if (err) {
                console.error(`Error fetching ${key}:`, err.message);
                stats[key] = 0;
            } else {
                stats[key] = row.count !== undefined ? row.count : row;
            }
            completed++;
            if (completed === keys.length) {
                res.json(stats);
            }
        });
    });
});

// 2. APPLICATIONS (All submitted/processing/admitted/rejected)
router.get('/applications', (req, res) => {
    const sql = "SELECT * FROM applications WHERE status != 'Draft' ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update Application Status
router.put('/applications/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = "UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?";
    db.run(sql, [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// 3. APPLICANTS (Show all even incomplete/Draft)
router.get('/applicants', (req, res) => {
    const sql = "SELECT * FROM applications ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Map fields for frontend compatibility
        const mappedRows = rows.map(row => ({
            ...row,
            id: row.application_id,
            full_name: `${row.first_name} ${row.last_name}`,
            phone: row.mobile_phone,
            programme: row.selected_programme,
            programmeName: row.selected_programme,
            electiveCombination: row.selected_combination,
            dateOfBirth: row.dob,
            address: row.home_address,
            city_town: row.city,
            region_state: row.contact_region
        }));
        
        res.json(mappedRows);
    });
});

// 4. ADMISSIONS (Only approved/Admitted)
router.get('/admissions', (req, res) => {
    const sql = "SELECT * FROM applications WHERE status = 'Admitted' ORDER BY updated_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 5. PAYMENTS
router.get('/payments', (req, res) => {
    const sql = `
        SELECT p.*, a.first_name, a.last_name 
        FROM payments p 
        LEFT JOIN applications a ON p.application_id = a.application_id 
        ORDER BY p.payment_date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 6. DOCUMENTS
router.get('/documents', (req, res) => {
    const sql = `
        SELECT d.*, a.first_name, a.last_name 
        FROM documents d 
        LEFT JOIN applications a ON d.application_id = a.application_id 
        ORDER BY d.upload_date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 7. REPORTS
router.get('/reports', (req, res) => {
    const queries = {
        byStatus: "SELECT status, COUNT(*) as count FROM applications GROUP BY status",
        byProgramme: "SELECT selected_programme, COUNT(*) as count FROM applications GROUP BY selected_programme",
        byGender: "SELECT gender, COUNT(*) as count FROM applications GROUP BY gender"
    };

    const reports = {};
    const keys = Object.keys(queries);
    let completed = 0;

    keys.forEach(key => {
        db.all(queries[key], [], (err, rows) => {
            if (err) {
                reports[key] = [];
            } else {
                reports[key] = rows;
            }
            completed++;
            if (completed === keys.length) {
                res.json(reports);
            }
        });
    });
});

// 8. ADMIN USERS
router.get('/users', (req, res) => {
    const sql = "SELECT id, email, full_name, role, created_at FROM admin_users";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/users', (req, res) => {
    const { email, password, full_name, role } = req.body;
    const sql = "INSERT INTO admin_users (email, password, full_name, role) VALUES (?, ?, ?, ?)";
    db.run(sql, [email, password, full_name, role], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true });
    });
});

router.post('/logout', (req, res) => {
    // Since we're using JWT or session-less auth mostly, we just return success
    // If using express-session, we would do req.session.destroy()
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
