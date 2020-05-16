const crypto = require('crypto')
const encoding = 'utf8'

const MY_SECRET_HMAC = process.env.MY_SECRET_HMAC

module.exports = {
  hash(data, secretKey = MY_SECRET_HMAC) {
    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(data)
    return hmac.digest('hex')
  },
  verifyHash(hash1, hash2) {
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
}
