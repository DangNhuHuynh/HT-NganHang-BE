var express = require('express');
var transaction_history_router = express.Router();
var bols = require('../model_bols');

transaction_history_router.get('/receive', async function (req, res, next) {
  const account = await helpers.data_helper.get_bank_account(req.query.account_number)
  if (!account) {
    return res.status(400).json({ message: 'Account doesn\'t exists', data: {} })
  }

  const transactions = await bols.My_model.find_all('TransactionHistory', {
    receiver_account_number: account.account_number,
    status: 1,
    transaction_type: 0
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

transaction_history_router.get('/remit', async function (req, res, next) {
  const account = await helpers.data_helper.get_bank_account(req.query.account_number)
  if (!account) {
    return res.status(400).json({ message: 'Account doesn\'t exists', data: {} })
  }

  const transactions = await bols.My_model.find_all('TransactionHistory', {
    remitter_account_number: account.account_number,
    status: 1,
    transaction_type: 0
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

transaction_history_router.get('/debt', async function (req, res, next) {
  const account = await helpers.data_helper.get_bank_account(req.query.account_number)
  if (!account) {
    return res.status(400).json({ message: 'Account doesn\'t exists', data: {} })
  }

  const transactions = await bols.My_model.find_all('TransactionHistory', {
    remitter_account_number: account.account_number,
    status: 1,
    transaction_type: 1
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

transaction_history_router.get('/me/receive', async function (req, res, next) {
  const { customer } = await helpers.auth_helper.get_userinfo(req.user._id)
  const accountNumber = req.query.account_number

  const oneMonth = 24 * 60 * 60 * 1000 * 30
  const oneMonthUnix = Date.now() - oneMonth
  const accounts = await helpers.data_helper.get_all_bank_accounts(customer, { accountNumber })
  const accountNumberList = accounts.map(account => account.account_number)
  const transactions = await bols.My_model.find_all('TransactionHistory', {
    receiver_account_number: {"$in": accountNumberList },
    createdAt: { $gte: oneMonthUnix },
    transaction_type: 0,
    status: 1,
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});


transaction_history_router.get('/me/remit', async function (req, res, next) {
  const { customer } = await helpers.auth_helper.get_userinfo(req.user._id)
  const accountNumber = req.query.account_number

  const oneMonth = 24 * 60 * 60 * 1000 * 30
  const oneMonthUnix = Date.now() - oneMonth
  const accounts = await helpers.data_helper.get_all_bank_accounts(customer, { accountNumber })
  const accountNumberList = accounts.map(account => account.account_number)
  const transactions = await bols.My_model.find_all('TransactionHistory', {
    remitter_account_number: {"$in": accountNumberList },
    createdAt: { $gte: oneMonthUnix },
    transaction_type: 0,
    status: 1,
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

transaction_history_router.get('/me/debt', async function (req, res, next) {
  const { customer } = await helpers.auth_helper.get_userinfo(req.user._id)
  const accountNumber = req.query.account_number

  const oneMonth = 24 * 60 * 60 * 1000 * 30
  const oneMonthUnix = Date.now() - oneMonth
  const accounts = await helpers.data_helper.get_all_bank_accounts(customer, { accountNumber })
  const accountNumberList = accounts.map(account => account.account_number)
  const transactions = await bols.My_model.find_all('TransactionHistory', {
    remitter_account_number: {"$in": accountNumberList },
    createdAt: { $gte: oneMonthUnix },
    transaction_type: 1,
    status: 1,
  });

  return res.status(200).json({ message: 'Get history success.', data: transactions });
});

module.exports = transaction_history_router;
