const express = require("express");
const { readFileSync } = require('fs')
const path = require('path')
const test_controller = express.Router();
const rsaService = require('../services/crypto/rsa')
const hmacService = require('../services/crypto/hmac')

const publicKey = ''
const encoding = 'utf8'

test_controller.post('', async function (req, res, next) {
  rsaService.generateKeyPair()
  // const privateKeyPath = path.resolve('private.pem')
  // const privateKeyString = readFileSync(privateKeyPath, encoding)
  //
  // const data = JSON.stringify({
  //   ts: Date.now(),
  //   username: 'bahung1221',
  // })
  // const sign = rsaService.sign(data, privateKeyString)
  // const hash = hmacService.hash(data)
  return res.status(200).json({message: 'Generate sucessful.', data: {
    // sign,
    // verify: rsaService.verify(data, sign),
    // hash,
    // verifyHash: hmacService.verifyHash(hash, hmacService.hash(data))
  }});
})

module.exports = test_controller;
