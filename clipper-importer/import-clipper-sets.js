const { loginAsAdmin, fetchExistingCollections } = require('./scrapers/utils')
const scrapePPTrading = require('./scrapers/pp-trading')
const scrapeClipperdealer = require('./scrapers/clipperdealer')

async function main() {
  await loginAsAdmin()
  await fetchExistingCollections()
  //await scrapePPTrading()
  await scrapeClipperdealer()
}

main()
