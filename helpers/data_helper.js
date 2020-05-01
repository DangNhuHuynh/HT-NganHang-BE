var express = require('express');
var data_helper = express;
var db = require('./../models');
var bols = require('./../model_bols');
var moment = require('moment');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * @api {function} get_manage_role_name Lấy role name
 * @apiName get_userdata
 * @apiDescription Lấy tên của role để show ra view
 * @apiGroup data_helper
 * @apiVersion 1.0.0
 * @apiParam {String} id Thông tin _id của role.
 *
 */

data_helper.get_manage_role_name = async function(id){
    var item = null;
    if(id != undefined){
        item = await bols.My_model.findById('Manage_role', id);
    }

    if(item == null){
        return '';
    }
    else{
        //console.log(item.name);
        return item.name;
    }
}

data_helper.check_message_filter_keyword = async function(_keyword) {
    var item = null;
    console.log(_keyword);
    if(_keyword != undefined) {
        item = await db.Crm_message_filter_keyword.find({ "keyword": { $regex: _keyword, $options: "x" }});
    }
    console.log(item.length);
    console.log(item);
    if(item.length == 0) {
        return true;
    } else {
        return false;
    }
}

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

data_helper.get_bank_account = async function(accountNumber) {
  const [paymentAccount, savingAccount] = await Promise.all([
    bols.My_model.find_first('PaymentAccount', { account_number: accountNumber  }),
    bols.My_model.find_first('SavingAccount', { account_number: accountNumber }),
  ])

  return paymentAccount || savingAccount
}

module.exports = data_helper;
