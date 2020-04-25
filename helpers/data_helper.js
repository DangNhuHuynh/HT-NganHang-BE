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

data_helper.get_all_bank_accounts = async function(customer) {
  const customerId = new ObjectId(customer._id)
  const [paymentAccounts, savingAccounts] = await Promise.all([
    bols.My_model.find_all('PaymentAccount', { customer_id: customerId  }),
    bols.My_model.find_all('SavingAccount', { customer_id: customerId }),
  ])

  return [...paymentAccounts, ...savingAccounts]
}

module.exports = data_helper;
