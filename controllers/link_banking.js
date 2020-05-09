var express = require('express')
var link_banking = express.Router()
var bols = require('../model_bols')

link_banking.get('', async function (req, res, next) {
  const result = await bols.My_model.find_all('LinkBanking', {}, '_id name')

  return res.status(200).json({message: 'Get list banking success.', data: result})
})

link_banking.post('', async function (req, res, next) {
  req.checkBody("name", "Vui lòng nhập tên ngân hàng liên kết.").notEmpty()
  req.checkBody("publicKey", "Vui lòng nhập public key.").notEmpty()
  req.checkBody("secretKey", "Vui lòng nhập secret key.").notEmpty()

  var errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({message: errors, data: req.body})
  }
  const {name, publicKey, secretKey} = req.body
  const result = await bols.My_model.create('LinkBanking', {
    name,
    publicKey,
    secretKey,
    partnerId: _generatePartnerId()
  })
  if (result.status != 200) {
    return res.status(500).json({message: 'Create link banking fail.', data: {}})
  }

  return res.status(200).json({message: 'Create link banking success.', data: result.data})
})

function _generatePartnerId() {
  return Math.floor(Math.random() * 899999 + 100000)
}

module.exports = link_banking
