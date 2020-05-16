require('dotenv').config()
const rsaLinkApi = require('../services/link-converters/rsa/api')

async function run() {
  const data = {
    from: 'fake_people',
    fromAccountNumber: '000000123',
    toAccountNumber: '123456789',
    amount: 10000,
    description: 'Chuyển liên ngân hàng...'
  }

  const result = await rsaLinkApi.plusMoney(data)

  console.log(result)
}

run()
