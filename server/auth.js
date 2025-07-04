const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db.sqlite')

// Registrierung
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  const hash = await bcrypt.hash(password, 10)
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function (err) {
    if (err) return res.status(400).json({ error: 'Benutzer existiert bereits' })
    res.json({ success: true })
  })
})

// Login
router.post('/login', (req, res) => {
  const { username, password, remember } = req.body
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Falsche Anmeldedaten' })
    }

    req.session.userId = user.id
    req.session.username = user.username
    req.session.role = user.role

    if (remember) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000
    } else {
      req.session.cookie.expires = false
    }

    res.json({ success: true, username: user.username, role: user.role })
  })
})

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }))
})

module.exports = router
