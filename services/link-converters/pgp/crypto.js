const { readFileSync } = require('fs')
const path = require('path')
const openpgp = require('openpgp')
const bcrypt = require('bcryptjs')
const http = require('../../../helpers/http')

const BASE_URL = process.env.PGP_BANKING_ENDPOINT
const PUBLIC_KEY_PATH = process.env.PGP_BANKING_PUBLIC_KEY_PATH
const PGP_HASH_SECRET = process.env.PGP_BANKING_HASH_SECRET

const MY_PARTNER_CODE = process.env.PGP_BANKING_PARTNER_CODE
const MY_PRIVATE_KEY_PATH = path.join(process.cwd(), 'pgp-private.pem')
const LINK_PUBLIC_KEY_PATH = path.join(process.cwd(), PUBLIC_KEY_PATH)

const encoding = 'utf8'

const privateKeyString = readFileSync(MY_PRIVATE_KEY_PATH, encoding)
const linkPublicKeyString = readFileSync(LINK_PUBLIC_KEY_PATH, encoding)

async function createRequestWithHashing({ endpoint, data }) {
  const payload = _appendBody(data)
  const body = {
    ...payload,
    Hash: hash(payload),
  }

  console.log('=======REQUEST========')
  console.log({
    method: 'POST',
    url: BASE_URL + endpoint,
    body,
  })
  const response = await http.request({
    method: 'POST',
    url: BASE_URL + endpoint,
    body,
  })
  console.log('=======RESPONSE========')
  console.log(response)

  return response
}

async function createRequestWithSignature({ endpoint, data }) {
  const payload = _appendBody(data)
  const strPayload = JSON.stringify(payload)
  const body = {
    ...payload,
    Hash: hash(payload),
    Signature: await sign(strPayload),
  }

  const response = await http.request({
    method: 'POST',
    url: BASE_URL + endpoint,
    body,
  })

  return response
}

/**
 *
 * @param data
 * @returns {Promise<*>}
 */
async function sign(data) {
  const { keys: [privateKey] } = await openpgp.key.readArmored(privateKeyString)

  const { data: signatureArmored } = await openpgp.sign({
    message: openpgp.message.fromText(data),
    privateKeys: [privateKey],
  })

  return Buffer.from(signatureArmored).toString('base64')
}

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
function hash(data) {
  const arrToHash = [
    data.STTTH,
    data.STTTHAnother,
    MY_PARTNER_CODE,
    data.Time,
    data.Money,
    PGP_HASH_SECRET,
  ]
  const strToHash = arrToHash.filter(item => item !== undefined).join('')
  return bcrypt.hashSync(strToHash)
}

/**
 *
 * @param signature
 * @returns {Promise<boolean>}
 */
async function verifySign(signature) {
  const verified = await openpgp.verify({
    message: await openpgp.message.readArmored(signature.trim()),
    publicKeys: (await openpgp.key.readArmored(linkPublicKeyString)).keys
  });

  // await openpgp.stream.readToEnd(verified.data)

  const { valid } = verified.signatures[0]
  if (valid) {
    console.log('signed by key id ' + verified.signatures[0].keyid.toHex())
    return true
  } else {
    throw new Error('signature could not be verified')
  }
}

/**
 * Not verify because pgp link banking doesn't send back
 * @returns {Promise<boolean>}
 */
async function verifyHash() {
  return true
}

function _appendBody(data) {
  return {
    ...data,
    Time: parseInt(Date.now() / 1000).toString(),
    PartnerCode: MY_PARTNER_CODE,
  }
}

module.exports = {
  createRequestWithHashing,
  createRequestWithSignature,
  verifySign,
  verifyHash,
}
