const express = require('express')
const account = express.Router()
const bols = require('../model_bols')
const ObjectId = require('mongoose').Types.ObjectId
const rsaLinkApi = require('../services/link-converters/rsa/api')
const pgpLinkApi = require('../services/link-converters/pgp/api')

const ALL = 0
const PAYMENT_TYPE = 1
const SAVING_TYPE = 2

account.get('/me', async function (req, res, next) {
  const user = req.user
  const type = req.query.type || 0

  const customer = await bols.My_model.find_first('Customer', { account_id: new ObjectId(user._id) })

  if (!customer) {
    return res.status(500).json({ message: `Customer doesn't exists`, data: {} });
  }

  const [payments, savings] = await Promise.all([
    type == ALL || type == PAYMENT_TYPE ? bols.My_model.find_all('PaymentAccount', {
      customer_id: new ObjectId(customer._id)
    }) : [],
    type == ALL || type == SAVING_TYPE ? bols.My_model.find_all('SavingAccount', {
      customer_id: new ObjectId(customer._id)
    }) : [],
  ])
  const accounts = []

  payments.forEach(paymentAcc => {
    accounts.push({
      id: paymentAcc.id,
      account_number: paymentAcc.account_number,
      balance: paymentAcc.balance,
      type: PAYMENT_TYPE,
    })
  })

  savings.forEach(savingAcc => {
    accounts.push({
      id: savingAcc.id,
      account_number: savingAcc.account_number,
      balance: savingAcc.saved_money,
      type: SAVING_TYPE,
    })
  })

  if (accounts.length) {
    return res.status(200).json({ message: 'Get consumer credit success.', data: accounts });
  }

  return res.status(500).json({ message: `Account don't have consumer credit.`, data: {} });
});

account.get('/:account_number', async function (req, res, next) {
  const accountNumber = req.params.account_number
  const account = await bols.My_model.find_first('PaymentAccount', {
    account_number: accountNumber
  })
  if (!account) {
    return res.status(400).json({ message: `Account doesn't exists`, data: {} });
  }
  const customer = await bols.My_model.find_first('Customer', {
    _id: new ObjectId(account.customer_id)
  })
  if (!account) {
    return res.status(400).json({ message: `Customer doesn't exists`, data: {} });
  }
  return res.status(200).json({ message: 'Get account success.', data: {
      account_number: account.account_number,
      account_bank: 'HPK',
      customer_name: customer.name,
    }
  });
})

account.post('/transfer_and_delete', async function (req, res, next) {
  req.checkBody("account_number", "Vui lòng nhập số tài khoản cần xoá.").notEmpty();
  req.checkBody("target_account_number", "Vui lòng nhập số tài khoản cần nạp tiền.").notEmpty();

  var errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({message: errors, data: req.body})
  }

  const account_number = req.body.account_number
  const target_account_number = req.body.target_account_number
  const [paymentAccount, targetPaymentAccount] = await Promise.all([
    bols.My_model.find_first('PaymentAccount', {account_number}),
    bols.My_model.find_first('PaymentAccount', {account_number: target_account_number}),
  ])

  if (!paymentAccount || !targetPaymentAccount) {
    const errorAccountNumber = !paymentAccount ? paymentAccount.account_number : targetPaymentAccount.account_number
    return res.status(400).json({
      message: `Banking account with number ${errorAccountNumber} doesn't exists`,
      data: {},
    })
  }

  targetPaymentAccount.balance += parseInt(paymentAccount.balance) || 0
  await targetPaymentAccount.save()

  await bols.My_model.delete('PaymentAccount', { account_number: account_number })

  return res.status(200).json({
    message: 'Update balance successful',
    data: {}
  })
})

account.post('/:customerEmail', async function (req, res, next) {
  const customerEmail = req.params.customerEmail

  const user = await bols.My_model.find_first('Account', { email: customerEmail })
  if (!user) {
    return res.status(400).json({ message: `Customer doesn't exists`, data: {} });
  }

  const customer = await bols.My_model.find_first('Customer', { account_id: user._id })
  if (!customer) {
    return res.status(400).json({ message: `Customer doesn't exists`, data: {} });
  }

  const paymentAccount = await bols.My_model.create(req, 'PaymentAccount', {
    customer_id: new ObjectId(customer._id),
    account_number: await helpers.data_helper.generateAccountNumber(),
    balance: 0,
    status: 1,
  });

  return res.status(200).json({message: 'Create user success.', data: {
    id: paymentAccount.data._id,
    status: paymentAccount.data.status,
    account_number: paymentAccount.data.account_number,
    balance: paymentAccount.data.balance,
  }});
});

account.delete('/:account_number', async function (req, res, next) {
  const account_number = req.params.account_number

  const account = await helpers.data_helper.get_bank_account(account_number)
  if (!account) {
    return res.status(400).json({ message: `Payment account doesn't exists`, data: {} });
  }

  await bols.My_model.delete('PaymentAccount', { account_number: account_number })
  await bols.My_model.delete('SavingAccount', { account_number: account_number })

  return res.status(200).json({message: 'Delete account success.', data: {}});
});

account.get('/:bank_id/:account_number', async function (req, res, next) {
  const bankId = req.params.bank_id
  const accountNumber = req.params.account_number

  const linkBanking = await bols.My_model.find_first('LinkBanking', {
    _id: new ObjectId(bankId),
  })
  if (!linkBanking) {
    return res.status(500).json({ message: 'Ngân hàng không tồn tại.', data: { bank_id: req.params.bank_id } });
  }

  // TODO dummy
  // return res.status(200).json({ message: 'Get link account success.', data: _fakeResponseAccountInfo(req.params, linkBanking) })

  const data = {
    accountNumber,
  }

  try {
    // TODO: create map to handle multi link banking
    let result
    if (bankId === '5ec0b65749410a3695acea81') {
      const response = await rsaLinkApi.getAccountInfo(data)
      if (response.status != 200) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi kết nối với ngân hàng liên kết.', data: { link_message: result.message } })
      }

      const accountData = response.data || {}
      result = {
        account_number: accountData.accountNum,
        account_bank: linkBanking.name,
        customer_name: accountData.name,
      }
    }

    // TODO: create map to handle multi link banking
    else if (bankId === '5ec0d59381a9053d16c4eef3') {
      const response = await pgpLinkApi.getAccountInfo(data)
      if (response.status != 200) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi kết nối với ngân hàng liên kết.', data: { link_message: result.message } })
      }

      const accountData = response.data || {}
      result = {
        account_number: accountNumber,
        account_bank: linkBanking.name,
        customer_name: accountData.fullName,
      }
    }



    return res.status(200).json({ message: 'Get link account success.', data: result})
  } catch (e) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi kết nối với ngân hàng liên kết.', data: { link_message: e.message } })
  }
})

function _fakeResponseAccountInfo(input, linkBanking) {
  return {
    account_number: input.account_number,
    account_bank: linkBanking.name,
    customer_name: 'fake_person',
  }
}

module.exports = account;
