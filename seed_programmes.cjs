const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/database.sqlite');
const db = new sqlite3.Database(dbPath);

const programmes = [
  'General Arts',
  'General Science',
  'Business',
  'Visual Arts',
  'Home Economics',
  'Agricultural Science',
  'Technical / Applied Technology'
];

db.serialize(() => {
    const stmt = db.prepare("INSERT OR IGNORE INTO programmes (name, description) VALUES (?, ?)");
    programmes.forEach(name => {
        stmt.run(name, `Standard SHS ${name} programme.`);
    });
    stmt.finalize();
    console.log('Successfully inserted standard programmes.');
});

setTimeout(() => db.close(), 2000);
