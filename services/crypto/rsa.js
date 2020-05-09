const { writeFileSync, readFileSync } = require('fs')
const crypto = require('crypto')
const path = require('path')
const SECRET_RSA = 'A7Scu7FuuFFY3AHKaJzLF3bb'

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
  passphrase: SECRET_RSA, // protects the private key (key for Encryption private key)
}

const privateKeyPath = path.resolve(privateKeyFileName)
const privateKeyString = readFileSync(privateKeyPath, encoding)

function _getPrivateKeyObject() {
  return crypto.createPrivateKey({...privateKeyOption, key: privateKeyString})
}

function _getPublicKeyObject(publicKeyString) {
  return crypto.createPublicKey({...publicKeyOption, key: publicKeyString})
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
  verify(data, signature, publicKeyString) {
    let buffer = data
    if(!Buffer.isBuffer(data)) {
      buffer = Buffer.from(data, encoding)
    }
    return crypto.verify(algorithm, buffer, _getPublicKeyObject(publicKeyString), signature)
  }
}
