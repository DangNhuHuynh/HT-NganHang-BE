const express = require('express');
const transferMoneyRouter = express.Router();
const db = require('../models');
const bols = require('../model_bols');
const ObjectId = require('mongoose').Types.ObjectId;
const service = require('../services/transfer_money')

transferMoneyRouter.post('/deposit', async function (req, res, next) {
  req.checkBody("money", "Vui lòng nhập số tiền gửi.").notEmpty();
  req.checkBody("account_number", "Vui lòng nhập số tài khoản cần nạp tiền.").notEmpty();

  var errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({message: errors, data: req.body})
  }

  const account_number = req.body.account_number
  const [paymentAccount, savingAccount] = await Promise.all([
    bols.My_model.find_first('PaymentAccount', {account_number}),
    bols.My_model.find_first('SavingAccount', {account_number}),
  ])

  if (!paymentAccount && !savingAccount) {
    return res.status(400).json({
      message: `Banking account with number ${account_number} doesn't exists`,
      data: {},
    })
  }

  let account = paymentAccount || savingAccount
  account.balance += parseInt(req.body.money) || 0
  await account.save()

  return res.status(200).json({
    message: 'Update balance successful',
    data: {
      balance: account.balance
    }
  })
})

async function _getDefaultPaymentAccountByUsername(username) {
  const user = await bols.My_model.find_first('Account', {username})
  if (!user) {
    return null
  }

  const customer = await bols.My_model.find_first('Customer', {account_id: new ObjectId(user._id)})
  if (!customer) {
    return null
  }

  return await bols.My_model.find_first('PaymentAccount', {customer_id: new ObjectId(customer._id)})
}

/**
 *
 *
 *
 *
 *
 */
transferMoneyRouter.post('/transfer', async function (req, res, next) {
  const user = req.user;

  req.checkBody("remitter_account_number", "Vui lòng nhập số tài khoản nhận.").notEmpty();
  req.checkBody("receiver_account_number", "Vui lòng nhập số tài khoản nhận.").notEmpty();
  req.checkBody("bank_receiver", "Vui lòng nhập ngân hàng nhận.").notEmpty();
  req.checkBody("deposit_money", "Vui lòng nhập số tiền gửi.").notEmpty();
  req.checkBody("type_settle", "Vui lòng chọn Banking.").notEmpty();
  req.checkBody("billing_cost", "Vui lòng nhập billing cost.").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({message: errors, data: req.body});
  }

  const result = await service.newTransferRequest(req, user, req.body)

  res.status(result.code).json(result.res)
});

/**
 * Verification transfer money transaction otp
 */
transferMoneyRouter.post('/transfer/verification', async function (req, res, next) {
  const user = req.user;

  req.checkBody("transaction_id", "Vui lòng gửi mã giao dịch.").notEmpty();
  req.checkBody("otp", "Vui lòng nhập số OTP.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({message: errors, data: req.body});
  }

  const result = await service.verificationTransferRequest(req, user, req.body)
console.log(result);

  res.status(result.code).json(result.res)
});

module.exports = transferMoneyRouter;
