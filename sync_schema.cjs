const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/database.sqlite');
const db = new sqlite3.Database(dbPath);

const missingColumns = [
    { name: 'user_id', type: 'VARCHAR(100)' },
    { name: 'application_id_display', type: 'VARCHAR(50)' },
    { name: 'programme_name', type: 'VARCHAR(255)' },
    { name: 'enrollment_term', type: 'VARCHAR(100)' },
    { name: 'preferred_campus', type: 'VARCHAR(100)' },
    { name: 'passport_photo_url', type: 'TEXT' },
    { name: 'results_slip_url', type: 'TEXT' },
    { name: 'national_id_url', type: 'TEXT' },
    { name: 'declaration_accepted', type: 'BOOLEAN' },
    { name: 'digital_signature', type: 'TEXT' }
];

db.serialize(() => {
    console.log('--- SYNCING DATABASE SCHEMA ---');
    
    // Check which columns already exist
    db.all("PRAGMA table_info(applications)", (err, rows) => {
        if (err) {
            console.error('Error getting table info:', err.message);
            return;
        }
        
        const existingColumns = rows.map(r => r.name);
        console.log('Existing columns:', existingColumns.length);
        
        missingColumns.forEach(col => {
            if (!existingColumns.includes(col.name)) {
                console.log(`Adding missing column: ${col.name}`);
                db.run(`ALTER TABLE applications ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
                    if (alterErr) console.error(`Error adding ${col.name}:`, alterErr.message);
                    else console.log(`Successfully added ${col.name}`);
                });
            } else {
                console.log(`Column ${col.name} already exists.`);
            }
        });
    });
});

setTimeout(() => {
    db.close();
    console.log('Schema sync complete.');
}, 3000);
