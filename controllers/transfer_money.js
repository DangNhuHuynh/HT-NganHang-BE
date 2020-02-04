var express = require('express');
var transfer_money = express.Router();
var db = require('../models');
var bols = require('../model_bols');

/* GET home page. */
// transfer_money.get('/', function (req, res, next) {
// });

transfer_money.post('/', function (req, res, next) {
    const user = req.user;

    req.checkBody("receiver", "Vui lòng nhập số tài khoản nhận.").notEmpty();
    req.checkBody("bank_receiver", "Vui lòng nhập số tài khoản nhận.").notEmpty();
    req.checkBody("deposit_money", "Vui lòng nhập số tiền gửi.").notEmpty();
    // req.checkBody("description", "Vui lòng chọn Banking.").notEmpty();
    req.checkBody("type_settle", "Vui lòng chọn Banking.").notEmpty();
    req.checkBody("billing_cost", "Vui lòng chọn Banking.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ message: errors, data: req.body });
    } else {
        const credit = await bols.My_model.find_first('Consumer_credit', { account_id: user._id });
        if (credit) {
            const { receiver, bank_receiver, deposit_money, type_settle, billing_cost, description } = req.body;
            if (parseFloat(receiver) - parseFloat(deposit_money) >= 50000) {
                var data = {
                    bank_receiver,
                    receiver,
                    deposit_money,
                    type_settle,
                    billing_cost,
                    description,
                    remitter: credit.account_number,
                    bank_remitter: 'HPK',
                };

                const createTransfer = await bols.My_model.create(req, 'History_transfer', data);
                if (createTransfer.status == 200) {
                    const otp = helpers.helper.randomString('0123456789', 6);
                    const expried = Date.now() + 60000;

                    var cOPT = {
                        transfer_id: createTransfer._id,
                        otp_code: otp,
                        expried: expried,
                    };

                    const cOTPTransfer = await bols.My_model.create(req, 'Api_transfer_otp', cOTP);
                    if (cOTPTransfer.status == 200) {

                        var text = `
                            Dear ${user.name},\n
                            You have selected ${user.email} as your transfer ${deposit_money}VNĐ and verification page: ${otp}
                            This code will exprire 1 minus after this mail was sent.

                            Why you received this email.
                            Because you register email address in InternetBanking HPK.
                            If you did not make request, you can ignore this email.
                        `;

                        var mailOptions = {
                            from: 'doduyphuong433@gmail.com',
                            to: user.email,
                            subject: 'Authentication Transfer Money For Bill #' + createTransfer._id,
                            text: text
                        };

                        helpers.helper.sendMail(mailOptions);
                        
                        return res.status(200).json({ message: 'Giao dịch đang được thực hiện. Vui lòng xác thực OTP.', data: createTransfer.data });
                    } else {
                        // Xóa history giao dịch
                    }
                }

                return res.status(500).json({ message: 'Giao dịch không thành công.', data: req.body });
            } else {
                return res.status(400).json({ message: 'Tài khoản không đủ để thực hiện giao dịch.', data: req.body });
            }
        }
    }

    return res.status(500).json({ message: `Account don't have consumer credit.`, data: {} });
});

module.exports = transfer_money;