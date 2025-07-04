const axios = require('axios')
const cheerio = require('cheerio')
const { sendToClipperApp, estimateSizeFromName } = require('./utils')

const BASE_URL = 'https://feuerzeugguru.de'

module.exports = async function scrapeFeuerzeugguru() {
  console.log('📦 Scraping feuerzeugguru.de ...')
  for (let p = 1; p <= 2; p++) {
    const res = await axios.get(`${BASE_URL}/clipper/?order=name-asc&p=${p}`)
    const $ = cheerio.load(res.data)

    $('.product--box').each(async (_, el) => {
      const name = $(el).find('.product--title').text().trim()
      const img = $(el).find('.product--image-container img').attr('src')
      const image_url = img.startsWith('http') ? img : BASE_URL + img
      const link = $(el).find('a.product--image').attr('href')
      const url = BASE_URL + link

      const collection = {
        name,
        image_url,
        description: `Importiert von ${url}`,
        size: estimateSizeFromName(name)
      }

      await sendToClipperApp(collection)
    })
  }
}
