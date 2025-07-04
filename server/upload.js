const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { requireLogin, requireAdmin } = require('./middleware')

const router = express.Router()
const upload = multer({ dest: path.join(__dirname, '../public/uploads') })

// Bild hochladen
router.post('/upload-image', requireLogin, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('Kein Bild hochgeladen')
  const imageUrl = '/uploads/' + req.file.filename
  res.json({ image_url: imageUrl })
})

module.exports = router
