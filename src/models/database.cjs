const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the database path
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create the applications table if it doesn't exist
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS applications (
                application_id VARCHAR(50) PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                middle_name VARCHAR(100),
                last_name VARCHAR(100) NOT NULL,
                gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
                dob DATE NOT NULL,
                nationality VARCHAR(100) NOT NULL DEFAULT 'Ghanaian',
                place_of_birth VARCHAR(255) NOT NULL,
                region_of_origin VARCHAR(100),
                religion VARCHAR(100),
                marital_status VARCHAR(50) DEFAULT 'Single',
                home_address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                contact_region VARCHAR(100) NOT NULL,
                mobile_phone VARCHAR(20) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                guardian_name VARCHAR(255) NOT NULL,
                relationship VARCHAR(100) NOT NULL,
                guardian_occupation VARCHAR(255),
                guardian_phone VARCHAR(20) NOT NULL,
                guardian_address TEXT NOT NULL,
                guardian_email VARCHAR(255),
                jhs_name VARCHAR(255) NOT NULL,
                jhs_location VARCHAR(255) NOT NULL,
                jhs_district VARCHAR(100) NOT NULL,
                jhs_region VARCHAR(100) NOT NULL,
                jhs_year_completed INT,
                jhs_index_number VARCHAR(50) NOT NULL,
                bece_index_number VARCHAR(50) NOT NULL,
                bece_year INT NOT NULL,
                bece_aggregate DECIMAL(4, 1),
                bece_subjects JSON,
                selected_programme VARCHAR(100) NOT NULL,
                selected_combination VARCHAR(255) NOT NULL,
                accommodation_type VARCHAR(50) CHECK (accommodation_type IN ('Boarding', 'Day')),
                medical_conditions TEXT,
                blood_group VARCHAR(5),
                file_paths JSON,
                status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Processing', 'Admitted', 'Rejected')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                submitted_at TIMESTAMP
            )`);

            // Create payments table
            db.run(`CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application_id VARCHAR(50),
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Failed')),
                reference VARCHAR(100) UNIQUE,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES applications (application_id)
            )`);

            // Create documents table
            db.run(`CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application_id VARCHAR(50),
                document_type VARCHAR(50),
                file_name VARCHAR(255),
                file_path VARCHAR(255),
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES applications (application_id)
            )`);

            // Create admin_users table
            db.run(`CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                role VARCHAR(20) DEFAULT 'Admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Insert default admin if not exists
            db.run(`INSERT OR IGNORE INTO admin_users (email, password, full_name, role) 
                    VALUES ('admin@prestige.edu.gh', 'admin123', 'System Administrator', 'SuperAdmin')`);
        });

    }
});

// Function to close the database connection
function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('Error closing database', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
}

module.exports = {
    db,
    closeDatabase
};