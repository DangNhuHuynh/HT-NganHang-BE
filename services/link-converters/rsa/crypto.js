const { readFileSync } = require('fs')
const crypto = require('crypto')
const path = require('path')
const http = require('../../../helpers/http')

const BASE_URL = process.env.RSA_BANKING_ENDPOINT
const PUBLIC_KEY_PATH = process.env.RSA_BANKING_PUBLIC_KEY_PATH

const MY_PARTNER_CODE = process.env.RSA_BANKING_PARTNER_CODE
const MY_SECRET_RSA = process.env.MY_SECRET_RSA
const MY_SECRET_HMAC = process.env.MY_SECRET_HMAC
const MY_PRIVATE_KEY_PATH = path.join(process.cwd(), 'private.pem')

const SECRET_HMAC = process.env.RSA_BANKING_HASH_SECRET
const LINK_PUBLIC_KEY_PATH = path.join(process.cwd(), PUBLIC_KEY_PATH)
const encoding = 'utf8'
const algorithm = 'SHA256'

const privateKeyString = readFileSync(MY_PRIVATE_KEY_PATH, encoding)
const linkPublicKeyString = readFileSync(LINK_PUBLIC_KEY_PATH, encoding)

const publicKeyOption = {
  type: 'pkcs1',
  format: 'pem',
}

const privateKeyOption = {
  type: 'pkcs1',
  format: 'pem',
  cipher: 'aes-256-cbc',
  passphrase: MY_SECRET_RSA, // protects the private key (key for Encryption private key)
}

async function createRequestWithHashing({ endpoint, data }) {
  const payload = _appendBody(data)
  const body = {
    data: payload,
    hash: hash(JSON.stringify(payload), MY_SECRET_HMAC),
    partnerCode: MY_PARTNER_CODE,
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
    data: payload,
    hash: hash(strPayload, MY_SECRET_HMAC),
    sign: sign(strPayload),
    partnerCode: MY_PARTNER_CODE,
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

function sign(data) {
  let buffer = data
  if(!Buffer.isBuffer(data)) {
    buffer = Buffer.from(data, encoding)
  }
  return crypto.sign(algorithm, buffer, _getPrivateKeyObject(privateKeyString)).toString('base64')
}

function hash(data, secretHmac = MY_SECRET_HMAC) {
  console.log('-----')
  console.log({data, secretHmac})
  const hmac = crypto.createHmac(algorithm, secretHmac)
  hmac.update(data)
  return hmac.digest('hex')
}

function verifySign(data, signature) {
  let buffer = data
  if(!Buffer.isBuffer(data)) {
    buffer = Buffer.from(data, encoding)
  }
  const signDecodedBase64 = Buffer.from(signature, 'base64')
  const signBuffer = Buffer.from(signDecodedBase64, encoding)
  return crypto.verify(algorithm, buffer, _getPublicKeyObject(linkPublicKeyString), signBuffer)
}

function verifyHash(data, hash1) {
  const hash2 = hash(data, SECRET_HMAC)

  let buffer1 = hash1
  if(!Buffer.isBuffer(hash1)) {
    buffer1 = Buffer.from(hash1)
  }
  let buffer2 = hash2
  if(!Buffer.isBuffer(hash2)) {
    buffer2 = Buffer.from(hash2)
  }

  return crypto.timingSafeEqual(buffer1, buffer2)
}

function _appendBody(data) {
  return {
    ...data,
    ts: Date.now(),
  }
}

function _getPrivateKeyObject() {
  return crypto.createPrivateKey({...privateKeyOption, key: privateKeyString})
}

function _getPublicKeyObject(publicKeyString) {
  return crypto.createPublicKey({...publicKeyOption, key: publicKeyString})
}

module.exports = {
  sign,
  hash,
  verifySign,
  verifyHash,
  createRequestWithHashing,
  createRequestWithSignature,
}
