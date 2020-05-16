var express = require('express');
var list_receiver = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ReceiverModel = require('../models/receiver')
var ObjectId = require('mongoose').Types.ObjectId;

list_receiver.get('/me', async function (req, res, next) {
  const user = req.user;
  const {customer} = await helpers.auth_helper.get_userinfo(user._id)
  const receivers = await ReceiverModel
    .find({customer_id: new ObjectId(customer._id)})

  const data = receivers.map(async receiver => {
    const customer = await helpers.data_helper.get_customer_by_payment_account_number(receiver.account_number)
    return {
      ...receiver.toJSON(),
      name: customer.name,
    }
  })

  return res.status(200).json({message: `Get list receiver success.`, data: await Promise.all(data)});
});

// Create 1 receiver.
list_receiver.post('/', async function (req, res, next) {
  const user = req.user;
  req.checkBody("account_number", "Số TK không được trống.").notEmpty();
  req.checkBody("bank_id", "Vui lòng chọn Banking.").notEmpty();
  req.checkBody("nickname", "Vui lòng nhập tên gợi nhớ.").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({message: errors, data: req.body});
  }

  const {account_number, bank_id, nickname} = req.body
  const [{customer}, receiverBankAccount] = await Promise.all([
    helpers.auth_helper.get_userinfo(user._id),
    helpers.data_helper.get_payment_bank_account(account_number),
  ])

  if (!receiverBankAccount) {
    return res.status(400).json({message: `Tài khoản người nhận không tồn tại`, data: req.body});
  }
  const duplicateReciver = await bols.My_model.find_first('Receiver', {
    customer_id: new ObjectId(customer._id),
    account_number,
  });

  if (duplicateReciver) {
    return res.status(400).json({message: `Người nhận đã tồn tại`, data: req.body});
  }

  let bank = 'HPK'
  if (bank_id != 'HPK') {
    const linkBanking = await bols.My_model.find_first('LinkBanking', {
      _id: new ObjectId(bank_id),
    })

    if (!linkBanking) {
      return res.status(400).json({message: `Ngân hàng không tồn tại`, data: req.body});
    }
    bank = linkBanking.name
  }


  const data = {
    customer_id: customer._id,
    account_number,
    bank,
    nickname,
  }
  const receiver = await bols.My_model.create(req, 'Receiver', data);
  if (receiver.status != 200) {
    return res.status(400).json({message: `Tạo người nhận mới không thành công.`, data: req.body});
  }

  return res.status(200).json({message: `Tạo người nhận mới thành công.`, data: receiver.data});
});

module.exports = list_receiver;
