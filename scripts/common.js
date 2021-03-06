const { writeFileSync, readFileSync } = require('fs')
const crypto = require('crypto')
const path = require('path')
const http = require('../helpers/http')

const BASE_URL = 'http://localhost:3001/link-api/'
const PARTNER_ID = '842694'
const SECRET_RSA = 'BBScu7FuuFFY3AHKaJzLF3bb'
const SECRET_HMAC = 'BBvs4KZJFQMK22tvTvLPhT7K'
const LINK_SECRET_HMAC = '9yvs4KZJFQMK22tvTvLPhT7K'

const privateKeyPath = path.join(__dirname, 'fake_private.pem')
const linkPublicKeyPath = path.join(__dirname, '../public.pem')
const encoding = 'utf8'
const algorithm = 'SHA256'

const privateKeyString = readFileSync(privateKeyPath, encoding)
const linkPublicKeyString = readFileSync(linkPublicKeyPath, encoding)

const publicKeyOption = {
  type: 'pkcs1',
  format: 'pem',
}

const privateKeyOption = {
  type: 'pkcs1',
  format: 'pem',
  cipher: 'aes-256-cbc',
  passphrase: SECRET_RSA, // protects the private key (key for Encryption private key)
}

function createRequestWithHashing({ endpoint, data }) {
  const payload = _appendBody(data)
  const body = {
    data: payload,
    hash: hash(JSON.stringify(payload), SECRET_HMAC),
    partnerId: PARTNER_ID,
  }

  return http.request({
    method: 'POST',
    url: BASE_URL + endpoint,
    body,
  })
}

function createRequestWithSignature({ endpoint, data }) {
  const payload = _appendBody(data)
  const strPayload = JSON.stringify(payload)
  const body = {
    data: payload,
    hash: hash(strPayload, SECRET_HMAC),
    sign: sign(strPayload),
    partnerId: PARTNER_ID,
  }

  return http.request({
    method: 'POST',
    url: BASE_URL + endpoint,
    body,
  })
}

function sign(data) {
  let buffer = data
  if(!Buffer.isBuffer(data)) {
    buffer = Buffer.from(data, encoding)
  }
  return crypto.sign(algorithm, buffer, _getPrivateKeyObject(privateKeyString)).toString('base64')
}

function hash(data, secretHmac) {
  const hmac = crypto.createHmac('sha256', secretHmac)
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

function verifyHash(hash1, hash2) {
  let buffer1 = hash1
  if(!Buffer.isBuffer(hash1)) {
    buffer1 = Buffer.from(hash1, encoding)
  }
  let buffer2 = hash2
  if(!Buffer.isBuffer(hash2)) {
    buffer2 = Buffer.from(hash2, encoding)
  }
  return crypto.timingSafeEqual(buffer1, buffer2)
}

function _appendBody(data) {
  return {
    ...data,
    ts: Date.now(),
    recvWindow: 5000,
  }
}

function _getPrivateKeyObject() {
  return crypto.createPrivateKey({...privateKeyOption, key: privateKeyString})
}

function _getPublicKeyObject(publicKeyString) {
  return crypto.createPublicKey({...publicKeyOption, key: publicKeyString})
}

module.exports = {
  createRequestWithHashing,
  createRequestWithSignature,
  sign,
  hash,
  verifySign,
  verifyHash,
  LINK_SECRET_HMAC,
}
