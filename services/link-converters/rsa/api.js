const linkCrypto = require('./crypto')

async function getAccountInfo(input) {
  const data = {
    accountNum: input.accountNum
  }

  return await linkCrypto.createRequestWithHashing({ endpoint: 'info', data })
}

async function plusMoney(input) {
  const data = {...input}
  const result = await linkCrypto.createRequestWithSignature({ endpoint: 'plus', data })

  const jsonResponseData = JSON.stringify(result.data)
  const verifySignResult = linkCrypto.verifySign(jsonResponseData, result.signature)
  const verifyHashResult = linkCrypto.verifyHash(jsonResponseData, result.hash)

  if (verifySignResult && verifyHashResult) {
    return { status: 200, message: result.message, result }
  }

  return { status: 500, errorCode: result.errorCode, message: result.message, result }
}

async function minusMoney(input) {
  const data = {...input}
  const result = await linkCrypto.createRequestWithSignature({ endpoint: 'minus', data })

  const jsonResponseData = JSON.stringify(result.data)
  const verifySignResult = linkCrypto.verifySign(jsonResponseData, result.signature)
  const verifyHashResult = linkCrypto.verifyHash(jsonResponseData, result.hash)

  if (verifySignResult && verifyHashResult) {
    return { status: 200, message: result.message, result }
  }

  return { status: 500, errorCode: result.errorCode, message: result.message, result }
}

module.exports = {
  getAccountInfo,
  plusMoney,
  minusMoney,
}
