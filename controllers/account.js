const express = require('express')
const account = express.Router()
const bols = require('../model_bols')
const ObjectId = require('mongoose').Types.ObjectId
const hmacService = require('../services/crypto/hmac')
const rsaLinkApi = require('../services/link-converters/rsa/api')

const ALL = 0
const PAYMENT_TYPE = 1
const SAVING_TYPE = 2

account.get('/me', async function (req, res, next) {
  const user = req.user
  const type = req.query.type || 0

  const customer = await bols.My_model.find_first('Customer', { account_id: new ObjectId(user._id) })

  if (!customer) {
    return res.status(500).json({ message: `Customer doesn't exists`, data: {} });
  }

  const [payments, savings] = await Promise.all([
    type == ALL || type == PAYMENT_TYPE ? bols.My_model.find_all('PaymentAccount', {
      customer_id: new ObjectId(customer._id)
    }) : [],
    type == ALL || type == SAVING_TYPE ? bols.My_model.find_all('SavingAccount', {
      customer_id: new ObjectId(customer._id)
    }) : [],
  ])
  const accounts = []

  payments.forEach(paymentAcc => {
    accounts.push({
      id: paymentAcc.id,
      account_number: paymentAcc.account_number,
      balance: paymentAcc.balance,
      type: PAYMENT_TYPE,
    })
  })

  savings.forEach(savingAcc => {
    accounts.push({
      id: savingAcc.id,
      account_number: savingAcc.account_number,
      balance: savingAcc.saved_money,
      type: SAVING_TYPE,
    })
  })

  if (accounts.length) {
    return res.status(200).json({ message: 'Get consumer credit success.', data: accounts });
  }

  return res.status(500).json({ message: `Account don't have consumer credit.`, data: {} });
});


account.get('/:bank_id/:account_number', async function (req, res, next) {
  const bankId = req.params.bank_id
  const accountNumber = req.params.account_number

  const linkBanking = await bols.My_model.find_first('LinkBanking', {
    _id: new ObjectId(bankId),
  })
  if (!linkBanking) {
    return res.status(500).json({ message: 'Ngân hàng không tồn tại.', data: { bank_id: req.params.bank_id } });
  }

  // TODO: remove this fake response when integrate
  return res.status(200).json({ message: 'Get link account success.', data: _fakeResponseAccountInfo(req.params, linkBanking) })

  const data = {
    accountNum: accountNumber,
    ts: Date.now()
  }

  try {
    const result = await rsaLinkApi.getAccountInfo(data)
    if (result.code != 0) {
      res.status(500).json({ message: 'Có lỗi xảy ra khi kết nối với ngân hàng liên kết.', data: { link_message: result.message } })
    }

    const accountData = result.data || {}
    return res.status(200).json({ message: 'Get link account success.', data: {
        account_number: accountData.accountNum,
        account_bank: linkBanking.name,
        customer_name: accountData.name,
      }
    })
  } catch (e) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi kết nối với ngân hàng liên kết.', data: { link_message: e.message } })
  }
})

function _fakeResponseAccountInfo(input, linkBanking) {
  return {
    account_number: input.account_number,
    account_bank: linkBanking.name,
    customer_name: 'fake_person',
  }
}

module.exports = account;
