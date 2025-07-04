const express = require('express')
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session)
const path = require('path')
const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite' }),
  secret: 'clipper_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: null }
}))

// Module einbinden
require('./db')
app.use('/api', require('./auth'))
app.use('/api', require('./collections'))
app.use('/api', require('./ownership'))
app.use('/api', require('./upload'))

app.get('/api/session', (req, res) => {
  if (req.session.userId) {
    return res.json({ loggedIn: true, role: req.session.role })
  }
  res.json({ loggedIn: false })
})

app.listen(3000, () => {
  console.log('Server läuft unter http://localhost:3000')
})
