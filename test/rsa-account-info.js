require('dotenv').config()
const rsaLinkApi = require('../services/link-converters/rsa/api')

async function run() {
  const data = {
    accountNumber: '07251743899648',
  }

  const result = await rsaLinkApi.getAccountInfo(data)
}

run()
