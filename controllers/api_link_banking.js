const express = require('express');
const router = express.Router();
const bols = require('../model_bols');
const middleware = require('../configs/middlewware')
const ObjectId = require('mongoose').Types.ObjectId

const ERRORS = helpers.error_const

router.post('/account', middleware.linkApiVerifyWithHash, async function (req, res, next) {
  const { userName, accountNumber } = req.body.data || {}
  if (!userName && !accountNumber) {
    const err = ERRORS.INVALID_REQUEST_BODY
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
    return res.status(400).json({ error: err.code, message: err.message, data: req.body })
  }

  return res.json({ message: 'OK', data: account })
});

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
    userName: user.name,
    name: customer.name,
    phone: customer.phone,
    accountNumber: paymentAccount.account_number,
  }
}

module.exports = router;
