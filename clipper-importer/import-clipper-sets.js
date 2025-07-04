const { loginAsAdmin, fetchExistingCollections } = require('./scrapers/utils')
const scrapePPTrading = require('./scrapers/pp-trading')

async function main() {
  await loginAsAdmin()
  await fetchExistingCollections()
  await scrapePPTrading()
}

main()
