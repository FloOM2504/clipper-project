const puppeteer = require('puppeteer')
const { sendToClipperApp, estimateSizeFromName } = require('./utils')

module.exports = async function scrapePPTrading() {
  console.log('📦 Scraping https://www.pp-trading.de/Clipper-Sets mit Puppeteer ...')

  const browser = await puppeteer.launch({
    headless: 'new', // 'new' = moderner Headless-Modus von Chromium
    executablePath: puppeteer.executablePath()
  })

  const page = await browser.newPage()

  for (let pageNum = 1; ; pageNum++) {
    const url =
      pageNum === 1
        ? 'https://www.pp-trading.de/Clipper-Sets'
        : `https://www.pp-trading.de/Clipper-Sets_s${pageNum}`
    console.log(`🌍 Lade Seite ${pageNum}: ${url}`)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

    if (pageNum === 1) {
      try {
        const acceptButton = await page.waitForSelector(
          '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
          { visible: true, timeout: 5000 }
        )
        if (acceptButton) await acceptButton.click()
      } catch (_) {}
    }

    await page.waitForSelector('.productbox', { timeout: 20000 })

    const products = await page.$$eval('.productbox', (items) => {
      return items
        .map((item) => {
          const name = item.querySelector('.productbox-title a')?.textContent?.trim() || ''
          const img =
            item.querySelector('img')?.getAttribute('data-src') ||
            item.querySelector('img')?.src ||
            ''
          const link = item.querySelector('a')?.href || ''

          if (!name || !img || !link) return null

          let cleanName = name
            .replace(/^Clipper(?:®)?\s*/i, '')
            .replace(/^Feuerzeuge\s*/i, '')
            .replace(/^4er\s*Set[:\-\s]*/i, '')
            .replace(/^Set[:\-\s]*/i, '')
            .replace(/^Clipper\s+Feuerzeuge\s+/i, '')
            .replace(/^Clipper\s*/i, '')
            .trim()

          return {
            name: cleanName,
            image_url: img.startsWith('http') ? img : `https://www.pp-trading.de${img}`,
            description: ''
          }
        })
        .filter(Boolean)
    })

    console.log(`📊 Seite ${pageNum}: ${products.length} Produkte`)
    if (products.length === 0) break

    for (const col of products) {
      col.size = estimateSizeFromName(col.name)
      await sendToClipperApp(col)
    }
  }
}
