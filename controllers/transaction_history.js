var express = require('express');
var transaction_history_router = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;

transaction_history_router.get('/receiver', async function (req, res, next) {
  const account = await helpers.data_helper.get_bank_account(req.body.account_number)
  if (!account) {
    return res.status(400).json({ message: 'Account doesn\'t exists', data: {} })
  }

  const transactions = await bols.My_model.find_all('TransactionHistory', {
    receiver_account_id: new ObjectId(account._id)
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

transaction_history_router.get('/remitter', async function (req, res, next) {
  const account = await helpers.data_helper.get_bank_account(req.body.account_number)
  if (!account) {
    return res.status(400).json({ message: 'Account doesn\'t exists', data: {} })
  }

  const transactions = await bols.My_model.find_all('TransactionHistory', {
    remitter_account_id: new ObjectId(account._id)
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

transaction_history_router.get('/me/receiver', async function (req, res, next) {
  const { customer } = await helpers.auth_helper.get_userinfo(req.user.id)
  const accounts = await helpers.data_helper.get_all_bank_accounts(customer)
  const accountIds = accounts.map(account => new ObjectId(account._id))
  const transactions = await bols.My_model.find_all('TransactionHistory', {
    receiver_account_id: {"$in": accountIds }
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});


transaction_history_router.get('/me/remitter', async function (req, res, next) {
  const { customer } = await helpers.auth_helper.get_userinfo(req.user.id)
  const accounts = await helpers.data_helper.get_all_bank_accounts(customer)
  const accountIds = accounts.map(account => new ObjectId(account._id))
  const transactions = await bols.My_model.find_all('TransactionHistory', {
    remitter_account_id: {"$in": accountIds }
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

module.exports = transaction_history_router;
