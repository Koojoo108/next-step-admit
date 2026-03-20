const { db, closeDatabase } = require('./models/database.cjs');

const seed = () => {
    db.serialize(() => {
        db.run(`INSERT OR REPLACE INTO applications (
            application_id, first_name, last_name, email, dob, place_of_birth, 
            home_address, city, contact_region, mobile_phone, guardian_name, 
            relationship, guardian_phone, guardian_address, jhs_name, 
            jhs_location, jhs_district, jhs_region, jhs_index_number, 
            bece_index_number, bece_year, selected_programme, selected_combination, 
            status, created_at, updated_at, submitted_at
        ) VALUES (
            'SHS-2026-TEST001', 'John', 'Doe', 'john.doe@example.com', '2010-05-15', 'Accra', 
            '123 Main St', 'Accra', 'Greater Accra', '0240000001', 'James Doe', 
            'Father', '0240000002', '123 Main St', 'Accra Junior High', 
            'Accra', 'Accra Central', 'Greater Accra', '101010101', 
            '202020202', 2025, 'General Science', 'Physics, Chemistry, Biology', 
            'Submitted', datetime('now'), datetime('now'), datetime('now')
        )`);

        db.run(`INSERT OR REPLACE INTO applications (
            application_id, first_name, last_name, email, dob, place_of_birth, 
            home_address, city, contact_region, mobile_phone, guardian_name, 
            relationship, guardian_phone, guardian_address, jhs_name, 
            jhs_location, jhs_district, jhs_region, jhs_index_number, 
            bece_index_number, bece_year, selected_programme, selected_combination, 
            status, created_at, updated_at, submitted_at
        ) VALUES (
            'SHS-2026-TEST002', 'Jane', 'Smith', 'jane.smith@example.com', '2010-08-20', 'Kumasi', 
            '456 High St', 'Kumasi', 'Ashanti', '0240000003', 'Mary Smith', 
            'Mother', '0240000004', '456 High St', 'Kumasi Junior High', 
            'Kumasi', 'Kumasi Metro', 'Ashanti', '101010102', 
            '202020203', 2025, 'Business', 'Accounting, Economics, Business Management', 
            'Admitted', datetime('now'), datetime('now'), datetime('now')
        )`);

        db.run(`INSERT OR REPLACE INTO payments (application_id, amount, status, reference) 
        VALUES ('SHS-2026-TEST001', 150.00, 'Paid', 'REF-001')`);

        db.run(`INSERT OR REPLACE INTO payments (application_id, amount, status, reference) 
        VALUES ('SHS-2026-TEST002', 150.00, 'Paid', 'REF-002')`);

        console.log('Seed data inserted successfully.');
        closeDatabase();
    });
};

seed();
