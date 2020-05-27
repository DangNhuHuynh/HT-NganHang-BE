require('dotenv').config()
const rsaLinkApi = require('../services/link-converters/rsa/api')

async function run() {
  const data = {
    from: 'customer01',
    fromAccountNumber: '1005398',
    toAccountNumber: '07251743899648',
    amount: 10000,
    description: 'Chuyển liên ngân hàng...'
  }

  const result = await rsaLinkApi.plusMoney(data)

  console.log(result)
}

run()
