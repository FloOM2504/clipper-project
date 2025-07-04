const axios = require('axios')
const cheerio = require('cheerio')
const { sendToClipperApp, estimateSizeFromName } = require('./utils')

const BASE_URL = 'https://dieclipperdealer.de'

module.exports = async function scrapeClipperDealer() {
  console.log('📦 Scraping dieclipperdealer.de ...')
  const res = await axios.get(`${BASE_URL}/collections/all`)
  const $ = cheerio.load(res.data)

  $('div.grid__item').each(async (_, el) => {
    const name = $(el).find('a.full-unstyled-link').text().trim()
    const img = $(el).find('img').attr('src')
    if (!name || !img) return
    const image_url = img.startsWith('http') ? img : 'https:' + img
    const url = BASE_URL + $(el).find('a').attr('href')

    const collection = {
      name,
      image_url,
      description: `Importiert von ${url}`,
      size: estimateSizeFromName(name)
    }

    await sendToClipperApp(collection)
  })
}
