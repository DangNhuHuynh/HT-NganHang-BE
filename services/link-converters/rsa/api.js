const linkCrypto = require('./crypto')

async function getAccountInfo(input) {
  const data = {
    accountNum: input.accountNumber
  }

  const result = await linkCrypto.createRequestWithHashing({ endpoint: 'info', data })
  if (result.errorCode != 0) {
    return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
  }

  return { status: 200, message: result.message, data: result.data }
}

/**
 *
 * @param input
 * @returns {Promise<{result: *, errorCode: number, message: *, status: number}|{result: *, message: *, status: number}>}
 */
async function plusMoney(input) {
  const data = {
    from: input.from,
    from_account: input.fromAccountNumber,
    to_account: input.toAccountNumber,
    amount: input.amount,
    note: input.description,
    ts: Date.now()
  }
  const result = await linkCrypto.createRequestWithSignature({ endpoint: 'plus', data })

  if (result.errorCode != 0) {
    return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
  }

  const jsonResponseData = JSON.stringify(result.data)
  const verifySignResult = linkCrypto.verifySign(jsonResponseData, result.signature)
  const verifyHashResult = linkCrypto.verifyHash(jsonResponseData, result.hash)

  if (verifySignResult && verifyHashResult) {
    return { status: 200, message: result.message, data: result.data }
  }

  return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
}

/**
 *
 * @param input
 * @returns {Promise<{result: *, errorCode: number, message: *, status: number}|{result: *, message: *, status: number}>}
 */
async function minusMoney(input) {
  const data = {
    from: input.from,
    from_account: input.fromAccountNumber,
    to_account: input.toAccountNumber,
    amount: input.amount,
    note: input.description,
    ts: Date.now()
  }
  const result = await linkCrypto.createRequestWithSignature({ endpoint: 'minus', data })

  if (result.errorCode != 0) {
    return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
  }

  const jsonResponseData = JSON.stringify(result.data)
  const verifySignResult = linkCrypto.verifySign(jsonResponseData, result.signature)
  const verifyHashResult = linkCrypto.verifyHash(jsonResponseData, result.hash)

  if (verifySignResult && verifyHashResult) {
    return { status: 200, message: result.message, data: result.data }
  }

  return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
}

module.exports = {
  getAccountInfo,
  plusMoney,
  minusMoney,
}
