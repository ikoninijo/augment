const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database and SQL file paths
const dbPath = path.join(__dirname, '..', '..', 'database', 'safaricad.db');
const sqlPath = path.join(__dirname, '..', '..', 'database', 'safaricad.sql');

console.log('Initializing SafariCAD database...');
console.log('Database path:', dbPath);
console.log('SQL file path:', sqlPath);

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

// Read SQL file
if (!fs.existsSync(sqlPath)) {
  console.error('SQL file not found:', sqlPath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Create database and execute SQL
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Execute SQL statements
db.exec(sqlContent, (err) => {
  if (err) {
    console.error('Error executing SQL:', err.message);
    process.exit(1);
  }
  console.log('Database initialized successfully!');
  
  // Verify tables were created
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error querying tables:', err.message);
    } else {
      console.log('Created tables:');
      tables.forEach(table => {
        console.log('  -', table.name);
      });
    }
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  });
});
