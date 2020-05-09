const common = require('./common')

async function run() {
  const data = {
    userName: 'bahung1221',
    // accountNumber: '1974550'
  }
  const result = await common.createRequestWithHashing({ endpoint: 'account', data })

  console.log('======RESPONSE======')
  console.log(result)
}

run()
