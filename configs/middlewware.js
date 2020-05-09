const path = require('path')
const nJwt = require('njwt')
const bols = require('../model_bols');
const hmacService = require('../services/crypto/hmac')
const rsaService = require('../services/crypto/rsa')

const errors = helpers.error_const

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
  const linkBanking = await _getLinkBanking(partnerId)
  if (!linkBanking) {
    const err = errors.PARTNER_DOESNT_EXISTS
    return res.status(400).json({ error: err.code, message: err.message, data: {
      partnerId,
    }})
  }

  const reHash = hmacService.hash(JSON.stringify(data), linkBanking.secretKey)
  if (!hmacService.verifyHash(hash, reHash)) {
    const err = errors.INVALID_HASH
    return res.status(400).json({ error: err.code, message: err.message, data: req.body })
  }

  const now = Date.now()
  if (!_verifyTimestamp(data, now)) {
    const err = errors.REQUEST_EXPIRED
    const msg = err.message

    msg.replace('$1', data.ts || 0)
    msg.replace('$2', now)
    return res.status(400).json({
      error: err.code,
      message: msg,
      data: req.body
    })
  }

  req.linkBanking = linkBanking

  next()
}

async function linkApiVerifyWithSign(req, res, next) {
  const { data, hash, sign, partnerId } = req.body

  const linkBanking = await _getLinkBanking(partnerId)
  if (!linkBanking) {
    const err = errors.PARTNER_DOESNT_EXISTS
    return res.status(400).json({ error: err.code, message: err.message, data: {
        partnerId,
      }})
  }

  const reHash = hmacService.hash(JSON.stringify(data), linkBanking.secretKey)
  if (!hmacService.verifyHash(hash, reHash)) {
    const err = errors.INVALID_HASH
    return res.status(400).json({ error: err.code, message: err.message, data: req.body })
  }

  const publicKeyPath = path.join(process.cwd(), 'storages', linkBanking.publicKey)
  if (!await helpers.file_helper.exist(publicKeyPath)) {
    const err = errors.PUBLIC_KEY_DOESNT_EXISTS
    return res.status(400).json({ error: err.code, message: err.message, data: req.body })
  }

  const verifySign = rsaService.verify(JSON.stringify(data), sign, publicKeyPath)
  if (!verifySign) {
    const err = errors.INVALID_SIGNATURE
    return res.status(400).json({ error: err.code, message: err.message, data: req.body })
  }

  const now = Date.now()
  if (!_verifyTimestamp(data, now)) {
    const err = errors.REQUEST_EXPIRED
    const msg = err.message

    msg.replace('$1', data.ts || 0)
    msg.replace('$2', now)
    return res.status(400).json({
      error: err.code,
      message: msg,
      data: req.body
    })
  }

  req.linkBanking = linkBanking

  next()
}

function _getLinkBanking(partnerId) {
  return bols.My_model.find_first('LinkBanking', {
    partnerId,
  })
}

function _verifyTimestamp(data, now) {
  const recvWindow = data.recvWindow || 3000
  const ts = data.ts || 0

  return now - ts <= recvWindow
}

module.exports = {
  mdwAuth,
  linkApiVerifyWithHash,
  linkApiVerifyWithSign,
}
