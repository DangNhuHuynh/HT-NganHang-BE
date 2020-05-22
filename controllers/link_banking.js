const express = require('express')
const multer = require('multer')
const path = require('path')
const mkdirp = require('mkdirp')
const link_banking = express.Router()
const bols = require('../model_bols')

/**
 * Multer config for using disk storage instead memory storage (ram)
 * Use disk storage because we need to storage a lot of large file, so memory storage  can't be enough capacity
 */
const diskStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    mkdirp.sync('./tmp/uploads')
    cb(null, './tmp/uploads')
  },
  filename: function(req, file, cb) {
    const tmpFileName = file.fieldname + '-' + Date.now()
    req._tmpFilePath = path.join(__dirname, '../tmp/uploads', tmpFileName)
    cb(null, tmpFileName)
  }
})

const upload = multer({ storage: diskStorage })

/**
 * Get list linked banks
 */
link_banking.get('', async function (req, res, next) {
  const result = await bols.My_model.find_all('LinkBanking', {}, '_id name')

  return res.status(200).json({message: 'Get list banking success.', data: result})
})

/**
 * Get list linked banks
 */
link_banking.get('/transaction', async function (req, res, next) {
  const transactions = await bols.My_model.find_all('TransactionHistory', {
    $or: [
      { bank_receiver: { $ne: 'HPK' } },
      { bank_remitter: { $ne: 'HPK' } },
    ]
  })
  const banks = await bols.My_model.find_all('LinkBanking', {}, '_id name')
  const result = transactions.map(transaction => {
    const bank = banks.find(bank => bank._id == transaction.bank_remitter || bank._id == transaction.bank_receiver)

    return {
      ...transaction.toJSON(),
      link_banking_name: (bank || {}).name
    }
  })

  return res.status(200).json({message: 'Get list banking transactions success.', data: result})
})

/**
 * Link new bank
 */
link_banking.post('', upload.single('file'), async function (req, res, next) {
  req.on('aborted', function() {
    if (req._tmpFilePath) {
      helpers.file_helper.deleteFile(req._tmpFilePath)
    }
  })

  req.checkBody("name", "Vui lòng nhập tên ngân hàng liên kết.").notEmpty()
  req.checkBody("secretKey", "Vui lòng nhập secret key.").notEmpty()

  const errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({message: errors, data: req.body})
  }

  const publicKeyFile = req.file
  if (!publicKeyFile) {
    return res.status(400).json({message: 'Vui lòng upload public key file.', data: {}})
  }

  const { name, secretKey } = req.body
  const partnerId = _generatePartnerId()
  const publicKeyStoreName = `${partnerId}-public.pem`

  await helpers.file_helper.storeFile(publicKeyStoreName, publicKeyFile.path)

  const result = await bols.My_model.create(req, 'LinkBanking', {
    name,
    publicKey: publicKeyStoreName,
    secretKey,
    partnerId,
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
