const express = require('express');
const router = express.Router();
const bols = require('../model_bols');
const middleware = require('../configs/middlewware')
const ObjectId = require('mongoose').Types.ObjectId
const hmacService = require('../services/crypto/hmac')
const rsaService = require('../services/crypto/rsa')
const transferService = require('../services/transfer_money')

const ERRORS = helpers.error_const

/**
 * Get account info
 */
router.post('/account', middleware.linkApiVerifyWithHash, async function (req, res, next) {
  const { userName, accountNumber } = req.body.data || {}
  if (!userName && !accountNumber) {
    const err = ERRORS.INVALID_REQUEST_BODY
    console.log("========LINK RESPONSE=======")
    console.log({ error: err.code, message: err.message, data: req.body })
    return res.status(400).json({ error: err.code, message: err.message, data: req.body })
  }

  let account
  if (accountNumber) {
    account = await _getAccountByNumber(accountNumber)
  }
  if (userName && !account) {
    account = await _getAccountByUserName(userName)
  }

  // Still empty
  if (!account) {
    const err = ERRORS.ACCOUNT_DOESNT_EXISTS
    console.log("========LINK RESPONSE=======")
    console.log({ error: err.code, message: err.message, data: req.body })
    return res.status(400).json({ error: err.code, message: err.message, data: req.body })
  }
  console.log("========LINK RESPONSE=======")
  console.log({ message: 'OK', data: account })

  return res.json({ message: 'OK', data: account })
});

router.post('/money-transfer/plus', middleware.linkApiVerifyWithSign, async function (req, res, next) {
  let { amount } = req.body.data || {}

  _transferMoney(amount, req, res)
})

router.post('/money-transfer/minus', middleware.linkApiVerifyWithSign, async function (req, res, next) {
  let { amount } = req.body.data || {}

  _transferMoney(-amount, req, res)
})

async function _transferMoney(parsedAmount, req, res) {
  const { from, fromAccountNumber, toAccountNumber, amount, description } = req.body.data || {}
  const linkBanking = req.linkBanking

  const data = {
    remitter_account_number: fromAccountNumber,
    bank_remitter: linkBanking.name,
    receiver_account_number: toAccountNumber,
    bank_receiver: 'HPK',
    deposit_money: parsedAmount,
    type_settle: 0,
    billing_cost: 0,
    status: 1,
    description,
    transaction_type: 0,
  };

  const transaction = await bols.My_model.create(req, 'TransactionHistory', data);
  if (transaction.status != 200) {
    const err = ERRORS.UNKNOWN
    console.log("========LINK RESPONSE=======")
    console.log({ error: err.code, message: err.message, data: req.body })
    return res.status(500).json({ error: err.code, message: err.message, data: req.body })
  }

  const balance = await transferService.updateBalance(toAccountNumber, parsedAmount)
  if (balance.error) {
    await bols.My_model.delete(req, 'TransactionHistory', { _id: new ObjectId(transaction._id) })
    console.log("========LINK RESPONSE=======")
    console.log({ error: balance.error.code, message: balance.error.message, data: {} })
    return res.status(400).json({ error: balance.error.code, message: balance.error.message, data: {} })
  }

  const transactionData = transaction.data
  const responseData = {
    transaction: {
      id: transactionData._id,
      accountNumber: transactionData.receiver_account_number,
      amount: Math.abs(transactionData.deposit_money)
    },
    ts: Date.now()
  }
  const hash = hmacService.hash(JSON.stringify(responseData))
  const sign = rsaService.sign(JSON.stringify(responseData))
  console.log("========LINK RESPONSE=======")
  console.log({ message: 'OK', hash, sign, data: responseData })
  return res.json({ message: 'OK', hash, sign, data: responseData })
}

async function _getAccountByUserName(userName) {
  const user = await bols.My_model.find_first('Account', {
    username: userName,
  })

  if (!user) return null

  const { customer } = await helpers.auth_helper.get_userinfo(user._id)
  if (!customer) return null

  const paymentAccount = await helpers.data_helper.get_payment_bank_account_by_customer(customer._id)
  if (!paymentAccount) return null

  return {
    userName: user.name,
    name: customer.name,
    phone: customer.phone,
    accountNumber: paymentAccount.account_number,
  }
}

async function _getAccountByNumber(accountNumber) {
  const [paymentAccount, customer] = await Promise.all([
    helpers.data_helper.get_payment_bank_account(accountNumber),
    helpers.data_helper.get_customer_by_payment_account_number(accountNumber),
  ])
  if (!paymentAccount || !customer) return null

  const user = await bols.My_model.find_first('Account', {
    _id: new ObjectId(customer.account_id)
  })

  if (!user) return null

  return {
    userName: user.username,
    name: customer.name,
    phone: customer.phone,
    accountNumber: paymentAccount.account_number,
  }
}

module.exports = router;
