const linkCrypto = require('./crypto')

async function getAccountInfo(input) {
  const data = {
    STTTH: input.accountNumber.toString()
  }

  const result = await linkCrypto.createRequestWithHashing({ endpoint: 'InfoAccount', data })
  if (result.errorCode) {
    return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
  }

  return { status: 200, message: result.message, data: result.account }
}

/**
 *
 * @param input
 * @returns {Promise<{result: *, errorCode: number, message: *, status: number}|{result: *, message: *, status: number}>}
 */
async function plusMoney(input) {
  const data = {
    STTTHAnother: input.fromAccountNumber.toString(),
    STTTH: input.toAccountNumber.toString(),
    Money: input.amount.toString(),
    content: input.description,
  }
  const result = await linkCrypto.createRequestWithSignature({ endpoint: 'TranferInternerAnotherBank', data })

  if (result.errorCode) {
    return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
  }

  const responseData = result
  const verifySignResult = linkCrypto.verifySign(responseData.sign)
  const verifyHashResult = linkCrypto.verifyHash()

  if (verifySignResult && verifyHashResult) {
    return { status: 200, message: responseData.message, data: responseData }
  }

  return { status: 500, errorCode: result.errorCode, message: result.message, data: {} }
}

/**
 *
 * @param input
 * @returns {Promise<{result: *, errorCode: number, message: *, status: number}|{result: *, message: *, status: number}>}
 */
async function minusMoney(input) {
  return { status: 500, errorCode: 99999, message: 'Ngân hàng liên kết không hỗ trợ api trừ tiền.', result: {} }
}

module.exports = {
  getAccountInfo,
  plusMoney,
  minusMoney,
}
