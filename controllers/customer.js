var express = require("express");
var ObjectId = require('mongoose').Types.ObjectId;
var customerRouter = express.Router();
var bols = require('../model_bols');

customerRouter.post("/", async function (req, res) {
  req.checkBody("username", "Vui lòng nhập tài khoản").notEmpty();
  req.checkBody("password", "Vui lòng nhập mật khẩu").notEmpty();
  req.checkBody("name", "Vui lòng nhập mật khẩu").notEmpty();
  req.checkBody("email", "Vui lòng nhập mật khẩu").notEmpty();
  req.checkBody("phone", "Vui lòng nhập mật khẩu").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.json(errors);
  }

  const username = req.body.username;
  var existsUser = await bols.My_model.find_first('Account', {username}, 'username status');
  if (existsUser) {
    // Tồn tại username
    delete (req.body.password);
    return res.status(400).json({message: 'Username is exist.', data: req.body});
  }

  var data = req.body;
  var account = await bols.My_model.create(req, 'Account', data);

  if (account.status != 200) {
    return res.status(500).json({message: account.data, data: req.body});
  }

  account = account.data

  var customer = await bols.My_model.create(req, 'Customer', {
    account_id: new ObjectId(account._id),
    name: req.body.name,
    phone: req.body.phone,
  });
  var paymentAccount = await bols.My_model.create(req, 'PaymentAccount', {
    customer_id: new ObjectId(customer.data._id),
    account_number: await helpers.data_helper.generateAccountNumber(),
    balance: 0,
    status: 1,
  });

  return res.status(200).json({message: 'Create user success.', data: {
      account_id: account._id,
      id: customer.data._id,
      email: account.email,
      username: account.username,
      name: customer.data.name,
      phone: customer.data.phone,
      paymentAccount: {
        id: paymentAccount.data._id,
        status: paymentAccount.data.status,
        account_number: paymentAccount.data.account_number,
        balance: paymentAccount.data.balance,
      }
    }});
});

module.exports = customerRouter;
