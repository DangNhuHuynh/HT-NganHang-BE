var express = require('express');
var data_helper = express;
var bols = require('./../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;

data_helper.get_customer_by_payment_account_number = async function(accountNumber) {
  const account = await bols.My_model.find_first('PaymentAccount', {
    account_number: accountNumber
  })
  return account ? bols.My_model.find_first('Customer', {
    _id: new ObjectId(account.customer_id)
  }) : null
}

data_helper.get_all_bank_accounts = async function(customer, opt = {}) {
  const customerId = new ObjectId(customer._id)
  const condition = {
    customer_id: customerId,
  }
  if (opt.accountNumber) {
    condition.account_number = opt.accountNumber
  }
  const [paymentAccounts, savingAccounts] = await Promise.all([
    bols.My_model.find_all('PaymentAccount', condition),
    bols.My_model.find_all('SavingAccount', condition),
  ])

  return [...paymentAccounts, ...savingAccounts]
}

data_helper.get_payment_bank_account = async function(accountNumber) {
  return bols.My_model.find_first('PaymentAccount', { account_number: accountNumber  })
}

data_helper.get_payment_bank_account_by_customer = async function(customerId) {
  return bols.My_model.find_first('PaymentAccount', { customer_id: new ObjectId(customerId) })
}

data_helper.get_bank_account = async function(accountNumber) {
  const [paymentAccount, savingAccount] = await Promise.all([
    bols.My_model.find_first('PaymentAccount', { account_number: accountNumber  }),
    bols.My_model.find_first('SavingAccount', { account_number: accountNumber }),
  ])

  return paymentAccount || savingAccount
}

module.exports = data_helper;
