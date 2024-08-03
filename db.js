const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Change the path to your database file
const db = new sqlite3.Database(path.join(__dirname, 'my-database.db'));

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        description TEXT,
        status TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
});

module.exports = db;
