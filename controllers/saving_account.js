var express = require('express');
var saving_account = express.Router();
var db = require('../models');
var bols = require('../model_bols');

/* GET home page. */
// saving_account.get('/', function (req, res, next) {
// });

saving_account.get('/me', function (req, res, next) {
    const user = req.user;
    const result = await bols.My_model.findById('Saving_account', user._id);
    if (result) {
        return res.status(200).json({ message: 'Get consumer credit success.', data: result });
    }

    return res.status(500).json({ message: `Account don't have saving account.`, data: {} });
});

saving_account.post('/', function (req, res, next) {
    const user = req.user;
    req.checkBody("deposit_money", "Tiền gửi không được trống.").notEmpty();
    req.checkBody("due", "Kỳ hạn không được trống.").notEmpty();
    req.checkBody("start_time", "Thời gian bắt đầu không thể trống.").notEmpty();
    req.checkBody("end_time", "Thời gian kết thúc không thể trống.").notEmpty();
    req.checkBody("interest_rate", "Lãi suất không thể trống.").notEmpty();
    req.checkBody("refund", "Hoàn tiền không thể trống.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ message: errors, data: req.body });
    } else {
        var start = new Date(req.body.start_time);
        var end = new Date(req.body.end_time);
        if (start.getTime() < end.getTime()) {
            var data = req.body;
            data.interest_rate = parseFloat(data.interest_rate);
            data['account_id'] = user._id;

            const createSavingAccount = await bols.My_model.create(req, 'Saving_account', data);
            if (createSavingAccount.status == 200) {
                return res.status(200).json({ message: 'Create saving account success.', data: createSavingAccount.data });
            }

            return res.status(500).json({ message: 'Create saving account fail.', data: req.body });
        } else {
            return res.status(400).json({ message: 'StartTime & EndTime is invalid', data: req.body });
        }
    }

});

module.exports = saving_account;