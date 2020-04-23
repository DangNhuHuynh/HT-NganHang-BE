var express = require('express');
var account = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;

const PAYMENT_TYPE = 1
const SAVING_TYPE = 2

account.get('/me', async function (req, res, next) {
  const user = req.user;
  console.log(user)

  const customer = await bols.My_model.find_first('Customer', { account_id: new ObjectId(user._id) })

  if (!customer) {
    return res.status(500).json({ message: `Customer doesn't exists`, data: {} });
  }

  const [payments, savings] = await Promise.all([
    bols.My_model.find_all('PaymentAccount', { customer_id: new ObjectId(customer._id) }),
    bols.My_model.find_all('SavingAccount', { customer_id: new ObjectId(customer._id) }),
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

module.exports = account;
