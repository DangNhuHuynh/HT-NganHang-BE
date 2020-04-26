var express = require('express');
var transferMoneyRouter = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;

transferMoneyRouter.post('/deposit', async function (req, res, next) {
  req.checkBody("money", "Vui lòng nhập số tiền gửi.").notEmpty();

  var errors = req.validationErrors()
  if (!req.body.username && !req.body.account_number) {
    errors = 'Vui lòng nhập tên đăng nhập hoặc số tài khoản'
  }
  if (errors) {
    return res.status(400).json({message: errors, data: req.body})
  }

  const account_number = req.body.account_number
  const username = req.body.username
  if (!account_number) {
    const paymentAccount = await _getDefaultPaymentAccountByUsername(username)
    paymentAccount.balance += parseInt(req.body.money) || 0
    await paymentAccount.save()

    return res.status(200).json({
      message: 'Update balance successful',
      data: {
        balance: paymentAccount.balance
      }
    })
  }

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
  // const user = req.user; // TODO
  const user = {
    _id: '5ea1d50f9504abc02b3034bd',
    username: 'bahung1221',
    email: 'bahung1221@gmail.com',
  }

  req.checkBody("receiver_account_number", "Vui lòng nhập số tài khoản nhận.").notEmpty();
  req.checkBody("bank_receiver", "Vui lòng nhập số tài khoản nhận.").notEmpty();
  req.checkBody("deposit_money", "Vui lòng nhập số tiền gửi.").notEmpty();
  req.checkBody("type_settle", "Vui lòng chọn Banking.").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({message: errors, data: req.body});
  }

  const { customer } = await helpers.auth_helper.get_userinfo(user._id)
  const paymentAccount = await bols.My_model.find_first('PaymentAccount', {
    customer_id: new ObjectId(customer._id)
  });
  if (!paymentAccount) {
    return res.status(400).json({message: `Account don't have payment account.`, data: {}});
  }

  const {receiver_account_number, bank_receiver, deposit_money, type_settle, description} = req.body;
  const billing_cost = 1100 // TODO: get billing cost dynamic

  // Người gửi trả phí giao dịch
  if (type_settle == 0) {
    // Số dư TK - (Tiền gửi + Phí giao dịch) >= 50000
    if (parseFloat(paymentAccount.balance) - (parseFloat(billing_cost) + parseFloat(deposit_money)) < 50000) {
      return res.status(400).json({message: 'Tài khoản không đủ số dư để thực hiện giao dịch.', data: req.body});
    }
  }

  var data = {
    remitter_account_number: paymentAccount.account_number,
    bank_remitter: 'HPK',
    receiver_account_number,
    bank_receiver,
    deposit_money,
    type_settle,
    billing_cost,
    description,
  };

  const transaction = await bols.My_model.create(req, 'TransactionHistory', data);
  if (transaction.status != 200) {
    return res.status(500).json({message: 'Giao dịch không thành công.', data: req.body});
  }

  const transactionId = transaction.data._id
  const otp = helpers.helper.randomString('0123456789', 6);
  const expried = Date.now() + (60000 * 5); // 5 minutes

  var cOTP = {
    transaction_id: transactionId,
    otp_code: otp,
    expried: expried,
  };

  const cOTPTransfer = await bols.My_model.create(req, 'TransferOtp', cOTP);
  if (cOTPTransfer.status != 200) {

    // Xóa history giao dịch
    await bols.My_model.delete('TransactionHistory', { _id: new ObjectId(transactionId) });
    return res.status(500).json({message: 'Giao dịch không thành công.', data: req.body});
  }

  var text = `
    Dear ${user.username},\n
    You have selected ${user.email} as your transfer ${deposit_money}VNĐ, your OTP: ${otp}
    This code will expires in 5 minutes after this mail was sent.

    Why you received this email.
    Because you register email address in InternetBanking HPK.
    If you did not make request, you can ignore this email.
  `;

  const mailOptions = {
    to: {
      name: user.username,
      email: user.email,
    },
    subject: 'Authentication Transfer Money For Bill #' + transactionId,
    text,
  }

  await helpers.mailjet.send(mailOptions)

  return res.status(200).json({
    message: 'Giao dịch đang được thực hiện. Vui lòng xác thực OTP.',
    data: transaction.data
  });
});

/**
 * Verification transfer money transaction otp
 */
transferMoneyRouter.post('/transfer/verification', async function (req, res, next) {
  // const user = req.user; // TODO
  const user = {
    _id: '5ea1d50f9504abc02b3034bd',
    username: 'bahung1221',
    email: 'bahung1221@gmail.com',
  }

  req.checkBody("transaction_id", "Vui lòng gửi mã giao dịch.").notEmpty();
  req.checkBody("otp", "Vui lòng nhập số OTP.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({message: errors, data: req.body});
  }

  const { transaction_id, otp } = req.body;
  const getApiOTP = await bols.My_model.find_first('TransferOtp', {transaction_id});
  if (!getApiOTP) {
    return res.status(500).json({message: `Giao dịch không tồn tại.`, data: req.body});
  }

  const timeSubmit = Date.now();
  if (getApiOTP.expired - timeSubmit < 0) {
    return res.status(400).json({message: `Mã xác thực đã quá hạn.`, data: req.body});
  }

  if (getApiOTP.otp_code != otp) {
    return res.status(400).json({message: `Mã xác thực không chính xác.`, data: req.body});
  }

  const transaction = await bols.My_model.update(req, 'TransactionHistory', {_id: transaction_id}, {status: 1});
  if (transaction.status != 200) {
    return res.status(500).json({message: `Xác thực chưa thành công. Xin vui lòng thử lại.`, data: req.body});
  }

  // Cập nhật lại số dư trong tài khoản
  const transactionData = transaction.data;
  var sub_balance = 0;
  var sum_balance = 0;
  if (transactionData.type_settle == 0) {
    sub_balance = parseFloat(transactionData.deposit_money) + parseFloat(transactionData.billing_cost);
    sum_balance = parseFloat(transactionData.deposit_money);
  } else {
    sub_balance = parseFloat(transactionData.deposit_money);
    sum_balance = parseFloat(transactionData.deposit_money) - parseFloat(transactionData.billing_cost);
  }

  const paymentAccount = await bols.My_model.find_first('PaymentAccount', {
    account_number: transactionData.remitter_account_number,
    status: 1
  });
  if (!paymentAccount) {
    await bols.My_model.update(req, 'TransactionHistory', {_id: transaction_id}, {status: 0});
    return res.status(400).json({message: `Tài khoản đã bị khóa hoặc không tồn tại.`, data: req.body});
  }

  const balance = parseFloat(paymentAccount.balance) - sub_balance;
  paymentAccount.balance = balance
  await paymentAccount.save()

  if (transactionData.bank_receiver.toLowerCase() == 'hpk') {
    const receiverPaymentAccount = await bols.My_model.find_first('PaymentAccount', {
      account_number: transactionData.receiver_account_number,
      status: 1
    });
    if (!receiverPaymentAccount) {
      // Fail, revert remitter account balance
      await bols.My_model.update(req, 'TransactionHistory', {_id: transaction_id}, {status: 0});
      paymentAccount.balance = balance + sub_balance
      await paymentAccount.save()
      return res.status(500).json({
        message: `Tài khoản nhận đã bị khóa hoặc không tồn tại.`,
        data: req.body
      });
    }

    const receiver_balance = receiverPaymentAccount.balance + sum_balance;
    receiverPaymentAccount.balance = receiver_balance
    await receiverPaymentAccount.save()

    await bols.My_model.update(req, 'TransferOtp', { transaction_id }, {status: 1});
    return res.status(200).json({message: 'Giao dịch thành công.', data: {}});
  }

  // Call API thực hiện giao dịch đối tác
  callApiLinkBanking();
});

// Call API thực hiện giao dịch đối tác
function callApiLinkBanking() {
  // TODO
}

module.exports = transferMoneyRouter;
