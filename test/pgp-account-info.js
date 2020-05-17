require('dotenv').config()
const pgpLinkApi = require('../services/link-converters/pgp/api')

async function run() {
  const data = {
    accountNumber: '100001',
  }

  const result = await pgpLinkApi.getAccountInfo(data)

  console.log(result)
}

run()
