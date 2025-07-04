const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db.sqlite')
const { requireLogin } = require('./middleware')

// Markierung speichern
router.put('/ownership', requireLogin, (req, res) => {
  const { collection_id, position, owned } = req.body
  db.run(
    `INSERT INTO ownership (user_id, collection_id, position, owned)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, collection_id, position)
     DO UPDATE SET owned = ?`,
    [req.session.userId, collection_id, position, owned, owned],
    function (err) {
      if (err) return res.status(500).send(err)
      res.json({ success: true })
    }
  )
})

// Gekaufte Positionen abrufen
router.get('/ownership/:collection_id', requireLogin, (req, res) => {
  db.all(
    `SELECT position, owned FROM ownership WHERE user_id = ? AND collection_id = ?`,
    [req.session.userId, req.params.collection_id],
    (err, rows) => {
      if (err) return res.status(500).send(err)
      res.json(rows)
    }
  )
})

module.exports = router
