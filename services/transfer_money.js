var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;

async function newTransferRequest(req, user, input) {
  const { customer } = await helpers.auth_helper.get_userinfo(user._id)
  const paymentAccount = await bols.My_model.find_first('PaymentAccount', {
    customer_id: new ObjectId(customer._id)
  });
  if (!paymentAccount) {
    return {
      code: 400,
      res: {
        message: `Account don't have payment account.`,
        data: input
      }
    }
  }

  const {receiver_account_number, bank_receiver, deposit_money, type_settle, description, transaction_type} = input;
  const billing_cost = 1100 // TODO: get billing cost dynamic

  // Người gửi trả phí giao dịch
  if (type_settle == 0) {
    // Số dư TK - (Tiền gửi + Phí giao dịch) >= 50000
    if (parseFloat(paymentAccount.balance) - (parseFloat(billing_cost) + parseFloat(deposit_money)) < 50000) {
      return {
        code: 400,
        res: {
          message: `Tài khoản không đủ số dư để thực hiện giao dịch.`,
          data: input,
        }
      }
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
    transaction_type: transaction_type || 0,
  };

  const transaction = await bols.My_model.create(req, 'TransactionHistory', data);
  if (transaction.status != 200) {
    return {
      code: 500,
      res: {
        message: `Giao dịch không thành công.`,
        data: input,
      }
    }
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
    return {
      code: 500,
      res: {
        message: `Giao dịch không thành công.`,
        data: input,
      }
    }
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

  await helpers.smtp_mailer.send(mailOptions)

  return {
    code: 200,
    res: {
      message: 'Giao dịch đang được thực hiện. Vui lòng xác thực OTP.',
      data: transaction.data,
    }
  }
}

async function verificationTransferRequest(req, user, input) {
  const { transaction_id, otp } = input;
  const getApiOTP = await bols.My_model.find_first('TransferOtp', { transaction_id });
  if (!getApiOTP) {
    return {
      code: 400,
      res: {message: `Giao dịch không tồn tại.`, data: input}
    }
  }

  const timeSubmit = Date.now();
  if (getApiOTP.expired - timeSubmit < 0) {
    return {
      code: 400,
      res: {message: `Mã xác thực đã quá hạn.`, data: input}
    }
  }

  if (getApiOTP.otp_code != otp) {
    return {
      code: 400,
      res: {message: `Mã xác thực không chính xác.`, data: input}
    }
  }

  const transaction = await bols.My_model.update(req, 'TransactionHistory', {_id: transaction_id}, {status: 1});
  if (transaction.status != 200) {
    return {
      code: 500,
      res: {message: `Xác thực chưa thành công. Xin vui lòng thử lại.`, data: input}
    }
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

    return {
      code: 400,
      res: {message: `Tài khoản đã bị khóa hoặc không tồn tại.`, data: input}
    }
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
      return {
        code: 400,
        res: {message: `Tài khoản nhận đã bị khóa hoặc không tồn tại.`, data: input}
      }
    }

    const receiver_balance = receiverPaymentAccount.balance + sum_balance;
    receiverPaymentAccount.balance = receiver_balance
    await receiverPaymentAccount.save()

    await bols.My_model.update(req, 'TransferOtp', { transaction_id }, {status: 1});

    return {
      code: 200,
      res: {message: 'Giao dịch thành công.', data: {}}
    }
  }

  // Call API thực hiện giao dịch đối tác
  return callApiLinkBanking()
}

// Call API thực hiện giao dịch đối tác
function callApiLinkBanking() {
  // TODO
}


module.exports = {
  newTransferRequest,
  verificationTransferRequest,
}