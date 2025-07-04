const https = require('https')
const http = require('http')
const { createWriteStream } = require('fs')

async function downloadImageFromUrl(url, destPath) {
  const client = url.startsWith('https') ? https : http

  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath)
    file.on('error', reject)

    const request = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close(() => fs.unlink(destPath, () => {}))
        return reject(new Error(`Bild konnte nicht geladen werden. HTTP ${res.statusCode}`))
      }

      res.pipe(file)
      file.on('finish', () => file.close(() => resolve(destPath)))
    })

    request.on('error', (err) => {
      fs.unlink(destPath, () => {})
      reject(err)
    })
  })
}

const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db.sqlite')
const path = require('path')
const fs = require('fs')
const fsp = fs.promises
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const { requireLogin, requireAdmin } = require('./middleware')

const clipperDir = path.join(__dirname, '../public/uploads/clippers')
if (!fs.existsSync(clipperDir)) fs.mkdirSync(clipperDir, { recursive: true })

async function sliceImageIntoParts(imagePath, outputDir, collectionId, partCount) {
  // Weißraum trimmen (mit erhöhtem Tolerance-Wert)
  const trimmedBuffer = await sharp(imagePath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .trim()
    .toBuffer()

  // Metadaten vom getrimmten Bild
  const { width, height } = await sharp(trimmedBuffer).metadata()
  const partWidth = Math.floor(width / partCount)

  // In gleich breite Parts schneiden
  const tasks = []
  for (let i = 0; i < partCount; i++) {
    const outputPath = path.join(outputDir, `collection_${collectionId}_${i + 1}.jpg`)
    tasks.push(
      sharp(trimmedBuffer)
        .extract({ left: i * partWidth, top: 0, width: partWidth, height })
        .toFile(outputPath)
    )
  }
  await Promise.all(tasks)
}

// GET all collections + ownerships for logged-in user
router.get('/collections', requireLogin, (req, res) => {
  db.all('SELECT * FROM collections', [], (err, collections) => {
    if (err) return res.status(500).send(err)

    db.all(
      'SELECT collection_id, position, owned FROM ownership WHERE user_id = ?',
      [req.session.userId],
      (err2, ownerships) => {
        if (err2) return res.status(500).send(err2)

        res.json({ collections, ownerships })
      }
    )
  })
})

// POST create new collection
router.post('/collections', requireLogin, requireAdmin, async (req, res) => {
  const { name, description, image_url, size } = req.body

  // ⛔ Check auf vorhandene Collection
  db.get('SELECT id FROM collections WHERE name = ?', [name], (err, row) => {
    if (err) return res.status(500).send(err)
    if (row) return res.status(409).json({ error: 'Collection bereits vorhanden' })

    // ✅ Nur wenn keine vorhanden ist: INSERT ausführen
    db.run(
      'INSERT INTO collections (name, description, image_url, size) VALUES (?, ?, ?, ?)',
      [name, description, image_url, size],
      async function (err) {
        if (err) return res.status(500).send(err)
        const collectionId = this.lastID
        let tmpPath = null
        try {
          let imagePath
          tmpPath = path.join(__dirname, '../public', `tmp_${collectionId}_${uuidv4()}.jpg`)
          await downloadImageFromUrl(image_url, tmpPath)
          imagePath = tmpPath

          const exists = await fsp
            .stat(imagePath)
            .then(() => true)
            .catch(() => false)
          if (!exists) throw new Error('Temporäre Bilddatei existiert nicht')

          if (!fs.existsSync(imagePath)) {
            if (tmpPath) await fsp.unlink(tmpPath).catch(() => {})
            return res.json({ id: collectionId })
          }

          const existing = await fsp.readdir(clipperDir)
          const toDelete = existing.filter((f) => f.startsWith(`collection_${collectionId}_`))
          await Promise.all(toDelete.map((f) => fsp.unlink(path.join(clipperDir, f))))
          await sliceImageIntoParts(imagePath, clipperDir, collectionId, size)
          console.log(`Collection-Bild in ${size} Teile geschnitten`)
        } catch (cutError) {
          console.error('(Upload) Fehler beim Zuschneiden:', cutError)
        }

        if (tmpPath) await fsp.unlink(tmpPath).catch(() => {})
        res.json({ id: collectionId })
      }
    )
  })
})

// PUT update collection
router.put('/collections/:id', requireLogin, requireAdmin, async (req, res) => {
  const { name, description, image_url, size } = req.body
  const collectionId = parseInt(req.params.id)

  db.run(
    'UPDATE collections SET name = ?, description = ?, image_url = ?, size = ? WHERE id = ?',
    [name, description, image_url, size, collectionId],
    async function (err) {
      if (err) return res.status(500).json({ error: err.message })
      let tmpPath = null
      try {
        const existing = await fsp.readdir(clipperDir)
        const toDelete = existing.filter((f) => f.startsWith(`collection_${collectionId}_`))
        await Promise.all(toDelete.map((f) => fsp.unlink(path.join(clipperDir, f))))
        if (image_url && image_url.trim() !== '') {
          let imagePath
          if (image_url.startsWith('/uploads/')) {
            tmpPath = path.join(__dirname, '../public', `tmp_${collectionId}_${uuidv4()}.jpg`)
            await downloadImageFromUrl(image_url, tmpPath)
            imagePath = tmpPath

            const exists = await fsp
              .stat(imagePath)
              .then(() => true)
              .catch(() => false)
            if (!exists) throw new Error('Temporäre Bilddatei existiert nicht')
          } else {
            tmpPath = path.join(__dirname, '../public', `tmp_${collectionId}_${uuidv4()}.jpg`)
            await downloadImageFromUrl(image_url, tmpPath)
            imagePath = tmpPath

            // Sicherstellen, dass Datei wirklich da ist
            const exists = await fsp
              .stat(imagePath)
              .then(() => true)
              .catch(() => false)
            if (!exists) throw new Error('Temporäre Bilddatei existiert nicht')
          }
          await sliceImageIntoParts(imagePath, clipperDir, collectionId, size)
          console.log(`(Edit) Collection-Bild in ${size} Teile geschnitten`)
        }
      } catch (cutError) {
        console.error('(Edit) Fehler beim Zuschneiden:', cutError)
      }

      if (tmpPath) await fsp.unlink(tmpPath).catch(() => {})
      res.json({ success: true })
    }
  )
})

// DELETE collection
router.delete('/collections/:id', requireLogin, requireAdmin, async (req, res) => {
  const collectionId = parseInt(req.params.id)
  let tmpPath = null
  try {
    const existing = await fsp.readdir(clipperDir)
    const toDelete = existing.filter((f) => f.startsWith(`collection_${collectionId}_`))
    await Promise.all(toDelete.map((f) => fsp.unlink(path.join(clipperDir, f))))

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM ownership WHERE collection_id = ?', [collectionId], function (err) {
        if (err) reject(err)
        else resolve()
      })
    })

    db.run('DELETE FROM collections WHERE id = ?', [collectionId], async function (err) {
      if (err) return res.status(500).json({ error: err.message })
      if (tmpPath) await fsp.unlink(tmpPath).catch(() => {})
      res.json({ success: true })
    })
  } catch (err) {
    console.error('Fehler beim Löschen:', err)
    res.status(500).json({ error: 'Fehler beim Löschen der Kollektion' })
  }
})

module.exports = router
