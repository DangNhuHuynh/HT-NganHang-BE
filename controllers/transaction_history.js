var express = require('express');
var transaction_history_router = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;

/* GET home page. */
// history_transfer.get('/', function (req, res, next) {
// });

transaction_history_router.get('/me', async function (req, res, next) {
    const { user, customer } = await helpers.auth_helper.get_userinfo(req)

    // Lấy danh sách giao dịch của bản thân. Bao gồm lịch sử gửi và nhận tiền.
    const result = await bols.My_model.find_all('TransactionHistory', { "$or": [{ remitter: user._id }, { receiver: user._id }] });
    // console.log(result);

    return res.status(200).json({ message: 'Get history success.', data: result });
});

transaction_history_router.get('/me/remitter', async function (req, res, next) {
    const user = req.user;
    // console.log(user);

    // Lấy danh sach giao dịch "chuyển tiền".
    const result = await bols.My_model.find_all('TransactionHistory', { remitter: user._id });
    // console.log(result);

    return res.status(200).json({ message: 'Get history success.', data: result });
});

transaction_history_router.get('/me/receiver', async function (req, res, next) {
    const user = req.user;
    // console.log(user);

    // Lấy danh sach giao dịch "nhận tiền".
    const result = await bols.My_model.find_all('TransactionHistory', { receiver: user._id });
    // console.log(result);

    return res.status(200).json({ message: 'Get history success.', data: result });
});

module.exports = transaction_history_router;
