const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('--- WIPING DEMO DATA ---');
    
    // Wipe from applications
    db.run("DELETE FROM applications WHERE email IN ('john.doe@example.com', 'jane.smith@example.com')", function(err) {
        if (err) console.error('Error wiping applications:', err.message);
        else console.log('Deleted from applications:', this.changes);
    });

    // Wipe from payments if any
    db.run("DELETE FROM payments WHERE application_id LIKE 'SHS-2026-TEST%'", function(err) {
        if (err) console.error('Error wiping payments:', err.message);
        else console.log('Deleted from payments:', this.changes);
    });

    // Wipe from documents if any
    db.run("DELETE FROM documents WHERE application_id LIKE 'SHS-2026-TEST%'", function(err) {
        if (err) console.error('Error wiping documents:', err.message);
        else console.log('Deleted from documents:', this.changes);
    });
});

setTimeout(() => {
    db.close();
    console.log('Done.');
}, 2000);
