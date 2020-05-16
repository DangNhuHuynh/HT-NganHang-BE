require('dotenv').config()
const rsaLinkApi = require('../services/link-converters/rsa/api')

async function run() {
  const data = {
    accountNumber: '123456789',
  }

  const result = await rsaLinkApi.getAccountInfo(data)

  console.log(result)
}

run()
