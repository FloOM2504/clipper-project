const axios = require('axios')

let cookieJar = '' // globales Session-Cookie
let existingNames = []

function estimateSizeFromName(name) {
  const match = name.match(/(\d+)[er\s]/i)
  if (match) return parseInt(match[1])
  return 4 // fallback
}

async function loginAsAdmin() {
  const res = await axios.post('http://localhost:3000/api/login', {
    username: 'admin',
    password: 'admin'
  })
  cookieJar = res.headers['set-cookie'].join('; ')
  console.log('🔐 Admin-Login erfolgreich mit Cookie:', cookieJar)
}

async function sendToClipperApp(collection) {
  if (existingNames.includes(collection.name.toLowerCase())) {
    console.log(`⏭️ Übersprungen (bereits vorhanden): ${collection.name}`)
    return
  }

  try {
    await axios.post('http://localhost:3000/api/collections', collection, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieJar
      }
    })
    console.log(`✅ Importiert: ${collection.name}`)
    existingNames.push(collection.name.toLowerCase()) // ← wichtig für Folgeseiten!
  } catch (err) {
    if (err.response?.status === 409) {
      console.log(`⏭️ Bereits vorhanden (Backend blockiert): ${collection.name}`)
    } else {
      console.error(
        `❌ Fehler bei ${collection.name}:`,
        err.response?.status,
        err.response?.data || err.message
      )
    }
  }
}

async function fetchExistingCollections() {
  const res = await axios.get('http://localhost:3000/api/collections', {
    headers: { Cookie: cookieJar }
  })
  existingNames = res.data.collections.map((c) => c.name.toLowerCase())
  console.log(`🧠 Duplikat-Cache geladen: ${existingNames.length} Namen`)
}

// 👇 Alles exportieren
module.exports = {
  loginAsAdmin,
  sendToClipperApp,
  estimateSizeFromName,
  fetchExistingCollections
}
