const puppeteer = require('puppeteer')
const { sendToClipperApp, estimateSizeFromName } = require('./utils')

module.exports = async function scrapeClipperdealer() {
  console.log('📦 Scraping https://dieclipperdealer.de/collections/all mit Puppeteer …')

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: puppeteer.executablePath()
  })
  const page = await browser.newPage()

  const baseUrl = 'https://dieclipperdealer.de/collections/all'
  for (let pageNum = 1; ; pageNum++) {
    const url = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`

    console.log(`🌍 Lade Seite ${pageNum}: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })

    // Falls Cookie-Banner da ist (ggf. Selector anpassen)
    try {
      const acceptBtn = await page.$('button[aria-label="Alle Cookies akzeptieren"]')
      if (acceptBtn) await acceptBtn.click()
    } catch (_) {}

    // Liste der Produkte abwarten
    await page.waitForSelector('li.grid__item', { timeout: 20000 })

    // Produkte extrahieren
    const products = await page.$$eval('li.grid__item', (items) =>
      items
        .map((item) => {
          const linkEl = item.querySelector('a')
          const imgEl = item.querySelector('img')
          const titleEl = item.querySelector('h3') // Shopify-Themes nutzen meist <h3> für Titles

          const name = titleEl?.textContent.trim() || ''
          const link = linkEl?.href || ''
          const img = imgEl?.src || ''

          if (!name || !link || !img) return null

          // Cleane den Namen wie beim pp-trading-Skript
          const cleanName = name
            .replace(/^Clipper(?:®)?\s*/i, '')
            .replace(/ Limited Edition$/i, '')
            .trim()

          return {
            name: cleanName,
            image_url: img,
            description: '',
            link
          }
        })
        .filter(Boolean)
    )

    console.log(`📊 Seite ${pageNum}: ${products.length} Produkte`)
    if (products.length === 0) break

    for (const col of products) {
      col.size = estimateSizeFromName(col.name)
      await sendToClipperApp(col)
    }
  }

  await browser.close()
}
