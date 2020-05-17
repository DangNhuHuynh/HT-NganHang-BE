require('dotenv').config()
const pgpLinkApi = require('../services/link-converters/pgp/api')

async function run() {
  const data = {
    from: 'customer01',
    fromAccountNumber: '1005398',
    toAccountNumber: '100001',
    amount: 10000,
    description: 'Chuyển liên ngân hàng...'
  }

  const result = await pgpLinkApi.plusMoney(data)
}

run()
