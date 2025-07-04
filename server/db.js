// SQLite Setup & initDB()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db.sqlite')

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )`)

    // Admin anlegen
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (row.count === 0) {
        const bcrypt = require('bcrypt')
        const hash = bcrypt.hashSync('admin', 10)
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
          'admin',
          hash,
          'admin'
        ])
        console.log('🛠 Admin-User angelegt: admin / admin')
      }
    })
  })
}

initDB()

module.exports = db
