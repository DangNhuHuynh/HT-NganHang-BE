var express = require('express');
var account = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;

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


account.get('/:account_number', async function (req, res, next) {
  const accountNumber = req.params.account_number

  const account = await bols.My_model.find_first('PaymentAccount', {
    account_number: accountNumber
  })

  if (!account) {
    return res.status(400).json({ message: `Account doesn't exists`, data: {} });
  }

  const customer = await bols.My_model.find_first('Customer', {
    _id: new ObjectId(account.customer_id)
  })

  if (!account) {
    return res.status(400).json({ message: `Customer doesn't exists`, data: {} });
  }

  return res.status(200).json({ message: 'Get account success.', data: {
      account_number: account.account_number,
      account_bank: 'HPK',
      customer_name: customer.name,
    }
  });
})

module.exports = account;
