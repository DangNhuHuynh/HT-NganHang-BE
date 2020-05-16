const { writeFileSync, readFileSync } = require('fs')
const crypto = require('crypto')
const path = require('path')
const MY_SECRET_RSA = process.env.MY_SECRET_RSA

const privateKeyFileName = 'private.pem'
const publicKeyFileName = 'public.pem'
const encoding = 'utf8'
const algorithm = 'SHA256'

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

const privateKeyPath = path.resolve(privateKeyFileName)
const privateKeyString = readFileSync(privateKeyPath, encoding)

function _getPrivateKeyObject() {
  return crypto.createPrivateKey({...privateKeyOption, key: privateKeyString})
}

function _getPublicKeyObject(publicKeyPath) {
  const publicKeyString = readFileSync(publicKeyPath, encoding)

  return crypto.createPublicKey({...publicKeyOption, key: publicKeyString })
}

module.exports = {
  generateKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: publicKeyOption,
      privateKeyEncoding: privateKeyOption,
    })

    writeFileSync(privateKeyFileName, privateKey)
    writeFileSync(publicKeyFileName, publicKey)
  },
  sign(data) {
    let buffer = data
    if(!Buffer.isBuffer(data)) {
      buffer = Buffer.from(data, encoding)
    }
    return crypto.sign(algorithm, buffer, _getPrivateKeyObject(privateKeyString))
  },
  verify(data, signature, publicKeyPath) {
    let dataBuffer = data
    if(!Buffer.isBuffer(data)) {
      dataBuffer = Buffer.from(data, encoding)
    }

    const signBuffer = Buffer.from(signature, encoding)
    return crypto.verify(algorithm, dataBuffer, _getPublicKeyObject(publicKeyPath), signBuffer)
  }
}
