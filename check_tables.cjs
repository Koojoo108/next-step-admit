const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('--- TABLES CHECK ---');
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) console.error(err);
        else console.log('Tables:', rows.map(r => r.name));
    });
});

setTimeout(() => db.close(), 2000);
