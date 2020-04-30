var express = require('express');
var debtReminderRouter = express.Router();
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;
const transferService = require('../services/transfer_money')

const REMINDER_FROM_CURRENT_CUSTOMER = 0
const REMINDER_TO_CURRENT_CUSTOMER = 1

debtReminderRouter.get('/me', async function (req, res, next) {
  const user = req.user

  const type = req.query.type // 0: ds nhắc nợ do customer tạo, 1: danh sách nhắc nợ do người khác tạo

  if (!type) {
    return res.status(400).json({ message: 'Invalid reminder type', data: {}})
  }

  const { customer } = await helpers.auth_helper.get_userinfo(user._id)
  const paymentAccount = await bols.My_model.find_first('PaymentAccount', {
    customer_id: new ObjectId(customer._id)
  })

  if (!customer || !paymentAccount) {
    return res.status(400).json({ message: 'Customer doesn\'t have payment account', data: {}})
  }

  const condition = {}
  if (type == REMINDER_FROM_CURRENT_CUSTOMER) {
    condition.account_number = paymentAccount.account_number
  } else {
    condition.debt_account_number = paymentAccount.account_number
  }

  const reminders = await bols.My_model.find_all('DebtReminder', condition);
  const promises = reminders.map(async reminder => {
    const [customer, debt_customer] = await Promise.all([
      helpers.data_helper.get_customer_by_payment_account_number(reminder.account_number),
      helpers.data_helper.get_customer_by_payment_account_number(reminder.debt_account_number)
    ])

    return {
      ...reminder.toJSON(),
      customer_name: customer ? customer.name : null,
      debt_customer_name: debt_customer ? debt_customer.name : null,
    }
  })
  return res.status(200).json({ message: 'Get reminders success.', data: await Promise.all(promises) });
});

debtReminderRouter.post('', async function (req, res, next) {
  const user = req.user;

  req.checkBody("debt_account_number", "Vui lòng nhập số tài khoản nhận.").notEmpty()
  // req.checkBody("debt_banking", "Vui lòng nhập số tài khoản nhận.").notEmpty()
  req.checkBody("money", "Vui lòng nhập số tiền gửi.").notEmpty()
  req.checkBody("description", "Vui lòng chọn Banking.").notEmpty()

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({message: errors, data: req.body});
  }

  const { customer } = await helpers.auth_helper.get_userinfo(user._id)
  const paymentAccount = await bols.My_model.find_first('PaymentAccount', {
    customer_id: new ObjectId(customer._id)
  })

  if (!customer || !paymentAccount) {
    return res.status(400).json({ message: 'Customer doesn\'t have payment account', data: {}})
  }
  if (paymentAccount.account_number === req.body.debt_account_number) {
    return res.status(400).json({ message: 'Current account number and target account number is same.', data: {}})
  }

  const data = {
    account_number: paymentAccount.account_number,
    banking: 'HPK',
    debt_account_number: req.body.debt_account_number,
    // debt_banking: req.body.debt_banking,
    debt_banking: 'HPK', // TODO: dynamic
    money: parseFloat(req.body.money) || 0,
    description: req.body.description,
  }
  const reminder = await bols.My_model.create(req, 'DebtReminder', data);

  if (reminder.status != 200) {
    return res.status(500).json({message: 'Tạo nhắc nợ không thành công.', data: req.body});
  }

  return res.status(200).json({
    message: 'Tạo nhắc nợ thành công.',
    data: reminder.data
  });
})

/**
 * Pay for a reminder
 */
debtReminderRouter.post('/:reminder_id/pay', async function (req, res, next) {
  const user = req.user;

  const { customer } = await helpers.auth_helper.get_userinfo(user._id)
  const paymentAccount = await bols.My_model.find_first('PaymentAccount', {
    customer_id: new ObjectId(customer._id)
  })

  if (!customer || !paymentAccount) {
    return res.status(400).json({ message: 'Customer doesn\'t have payment account', data: {}})
  }

  const reminder = await bols.My_model.find_first('DebtReminder', {
    _id: new ObjectId(req.params.reminder_id),
    status: 0,
  })
  if (!reminder) {
    return res.status(400).json({ message: 'Reminder doesn\'t exists or has been payed', data: {}})
  }

  const result = await transferService.newTransferRequest(req, user, {
    receiver_account_number: reminder.account_number,
    bank_receiver: reminder.banking,
    deposit_money: reminder.money,
    type_settle: 0, // Người gửi trả
    description: 'Pay for debt reminder #' + reminder._id,
    transaction_type: 1, // pay for debt reminder
  })

  res.status(result.code).json(result.res)
})

debtReminderRouter.post('/:reminder_id/pay/verification', async function (req, res, next) {
  const user = req.user;

  req.checkBody("transaction_id", "Vui lòng gửi mã giao dịch.").notEmpty();
  req.checkBody("otp", "Vui lòng nhập số OTP.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({message: errors, data: req.body});
  }

  const result = await transferService.verificationTransferRequest(req, user, req.body)
  if (result.code === 200) {
    const reminder = await bols.My_model.find_first('DebtReminder', {
      _id: new ObjectId(req.params.reminder_id),
      status: 0,
    })
    if (!reminder) {
      return res.status(400).json({ message: 'Có lỗi xảy ra trong quá trình xác thực.', data: {}})
    }

    reminder.status = 1
    await reminder.save()
  }

  res.status(result.code).json(result.res)
})

module.exports = debtReminderRouter;
