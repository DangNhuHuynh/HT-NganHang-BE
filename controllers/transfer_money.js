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

            // Người gửi trả phí giao dịch
            if (type_settle == 0) {
                // Số dư TK - (Tiền gửi + Phí giao dịch) >= 50000
                if (parseFloat(credit.balance) - (parseFloat(billing_cost) + parseFloat(deposit_money)) < 50000) {
                    return res.status(400).json({ message: 'Tài khoản không đủ để thực hiện giao dịch.', data: req.body });
                }
            }

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

                var cOTP = {
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
                    const dHistory = await bols.My_model.delete('History_transfer', { _id: createTransfer._id });
                    return res.status(500).json({ message: 'Giao dịch không thành công.', data: req.body });
                }
            } else {
                return res.status(500).json({ message: 'Giao dịch không thành công.', data: req.body });
            }
        }
    }

    return res.status(500).json({ message: `Account don't have consumer credit.`, data: {} });
});

transfer_money.post('/verification', function (req, res, next) {
    const user = req.user;

    req.checkBody("transfer_id", "Vui lòng gửi mã giao dịch.").notEmpty();
    req.checkBody("otp", "Vui lòng nhập số OTP.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ message: errors, data: req.body });
    } else {
        const { transfer_id, otp } = req.body;
        const getApiOTP = await bols.My_model.find_first('Api_transfer_otp', { transfer_id });
        if (getApiOTP) {
            const timeSubmit = Date.now();
            if (getApiOTP.expired - timeSubmit >= 0) {
                if (getApiOTP.otp_code == otp) {
                    
                    const uTransfer = await bols.My_model.update(req, 'History_transfer', { _id: transfer_id }, { status_transfer: 1 });
                    if (uTransfer.status == 200) {
                        // Cập nhật lại số dư trong tài khoản
                        const transf = uTransfer.data;
                        var sub_balance = 0;
                        var sum_balance = 0;
                        if (transf.type_settle == 0) {
                            sub_balance = parseFloat(transf.deposit_money) + parseFloat(transf.billing_cost);
                            sum_balance = parseFloat(transf.deposit_money);
                        } else {
                            sub_balance = parseFloat(transf.deposit_money);
                            sum_balance = parseFloat(transf.deposit_money) - parseFloat(transf.billing_cost);
                        }

                        const remitter_credit = await bols.My_model.find_first('Consumer_credit', { account_number: uTransfer.remitter, status: 1 });
                        if (remitter_credit) {
                            const balance = parseFloat(remitter_credit.balance) - sub_balance;
                            const u_remitter_credit = await bols.My_model.update(req, { account_number: uTransfer.remitter }, { balance });

                            if (u_remitter_credit.status == 200) {

                                if (uTransfer.bank_receiver.toLowerCase() == 'hpk') {
                                    const receiver_credit = await bols.My_model.find_first('Consumer_credit', { account_number: uTransfer.receiver, status: 1 });

                                    if (receiver_credit) {
                                        const receiver_balance = receiver_credit.balance + sum_balance;
                                        const u_receiver_credit = await bols.My_model.update(req, { account_number: uTransfer.receiver }, { balance: receiver_balance });

                                        if (u_receiver_credit.status == 200) {
                                            const uApiOTP = await bols.My_model.update(req, 'Api_transfer_otp', { transfer_id }, { status: 1 });
                                            return res.status(200).json({ message: 'Giao dịch thành công.', data: {} });
                                        }

                                    }

                                    const re_uTransfer = await bols.My_model.update(req, 'History_transfer', { _id: transfer_id }, { status_transfer: 0 });
                                    const re_u_remitter_credit = await bols.My_model.update(req, { account_number: uTransfer.remitter }, { balance: balance + sub_balance });
                                    return res.status(500).json({ message: `Tài khoản nhận đã bị khóa hoặc không tồn tại.`, data: req.body });

                                } else {
                                    // Call API thực hiện giao dịch đối tác
                                    callApiLinkBanking();
                                }

                            }

                        }

                        const re_uTransfer = await bols.My_model.update(req, 'History_transfer', { _id: transfer_id }, { status_transfer: 0 });
                        return res.status(500).json({ message: `Tài khoản đã bị khóa hoặc không tồn tại.`, data: req.body });

                    }

                    return res.status(500).json({ message: `Xác thực chưa thành công. Xin vui lòng thử lại.`, data: req.body });
                } else {
                    return res.status(400).json({ message: `Mã xác thực không chính xác.`, data: req.body });
                }
            } else {
                return res.status(400).json({ message: `Mã xác thực đã quá hạn.`, data: req.body });
            }
        }
    }

    return res.status(500).json({ message: `Giao dịch không tồn tại.`, data: req.body });
});

// Call API thực hiện giao dịch đối tác
function callApiLinkBanking() {

}

module.exports = transfer_money;