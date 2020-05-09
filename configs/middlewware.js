const express = require('express')
const nJwt = require('njwt')
const bols = require('../model_bols');
const hmacService = require('../services/crypto/hmac')
const rsaService = require('../services/crypto/rsa')

//middleware auth
async function mdwAuth(req, res, next) {
    //Check token
    if (req.headers.token) {
        var verifiedJwt
        var signingKey = config.app.secretKey
        try {
            var token = req.headers.token.toString()
            verifiedJwt = nJwt.verify(token, signingKey)
            req.user = verifiedJwt.body
        } catch (e) {
            console.log(e)
            return res.send({
                status: -999,
                data: {
                    message: 'Invalid token',
                },
            })
        }
    } else {
        return res.send({
            status: -999,
            data: {
                message: 'Invalid token',
            },
        })
    }

    next()
}

async function linkApiVerifyWithHash(req, res, next) {
  const { data, hash, partnerId } = req.body
  const linkBanking = await bols.My_model.find_first('LinkBanking', {
    partnerId,
  })
  if (!linkBanking) {
    return res.status(400).json({
      errorCode: 10001,
      message: 'Partner doesn\'t exists.',
      data: {
        partnerId,
      }
    })
  }

  const reHash = hmacService.hash(data, linkBanking.secretKey)
  if (!hmacService.verifyHash(hash, reHash)) {
    return res.status(400).json({
      errorCode: 10002,
      message: 'Invalid body, hash is different with body content.',
      data: req.body
    })
  }

  const now = Date.now()
  if (!_verifyTimestamp(data, now)) {
    return res.status(400).json({
      errorCode: 10003,
      message: `Request has expired, request timestamp is ${data.ts || 0}, server ts is ${now}`,
      data: req.body
    })
  }

  req.linkBanking = linkBanking

  next()
}

async function linkApiVerifyWithSign(req, res, next) {
  const { data, hash, sign, partnerId } = req.body

  next()
}

function _verifyTimestamp(data, now) {
  const recvWindow = data.recvWindow || 3000
  const ts = data.ts || 0

  return now - ts > recvWindow
}

module.exports = {
  mdwAuth,
  linkApiVerifyWithHash,
  linkApiVerifyWithSign,
}
