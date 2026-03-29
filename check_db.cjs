const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('--- DATABASE CHECK ---');
    
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='applications'", (err, row) => {
        if (err) {
            console.error('Error checking table:', err.message);
            return;
        }
        if (!row) {
            console.log('Table "applications" does NOT exist!');
            return;
        }
        
        db.get("SELECT count(*) as count FROM applications", (err, row) => {
            if (err) console.error(err.message);
            else console.log('Total applications:', row.count);
        });

        db.all("SELECT status, count(*) as count FROM applications GROUP BY status", (err, rows) => {
            if (err) console.error(err.message);
            else {
                console.log('Applications by status:');
                rows.forEach(r => console.log(`  - ${r.status}: ${r.count}`));
            }
        });
        
        db.all("SELECT * FROM applications LIMIT 1", (err, rows) => {
            if (err) console.error(err.message);
            else if (rows.length > 0) {
                console.log('Sample application structure:', Object.keys(rows[0]));
            } else {
                console.log('No applications found to show structure.');
            }
        });
    });
});

setTimeout(() => db.close(), 2000);
