var express = require('express');
var api_link_banking = express.Router();
var db = require('../models');
var bols = require('../model_bols');

/* GET home page. */
api_link_banking.post('/account', async function (req, res, next) {
    const { banking, data } = req.body;
    const checkBanking = await bols.My_model.find_first('Link_banking', { name: banking.toLowerCase() });
    if (checkBanking) {
        var decryptData = helpers.hash_helper.decrypedRSA(data);
        if (decryptData) {
            /*
        data = {
            account_number
        }
        */
            try {
                decryptData = JSON.parse(decryptData);
            } catch (error) {
                console.log(error);
            }

            const account = await bols.My_model.find_first('Consumer_credit', { account_number: decryptData.account_number }, 'account_id account_number', 'account_id');
            if (account) {
                const result = {
                    account_number: account.account_number,
                    name: account.account_id.name,
                    email: account.account_id.email,
                    phone: account.account_id.phone,
                };

                return res.status(200).json({ message: "Get success", data: result });
            }

            return res.status(400).json({ message: "Account number is not exist.", data: req.body });
        }

        return res.status(400).json({ message: "Error verify data.", data: req.body });
    }

    return res.status(400).json({ message: "Your banking not connect.", data: req.body });
});

api_link_banking.post('/push_money_account', async function (req, res, next) {
    const { banking, data } = req.body;
    const checkBanking = await bols.My_model.find_first('Link_banking', { name: banking.toLowerCase() });
    if (checkBanking) {
        var decryptData = helpers.hash_helper.decrypedRSA(data);
        if (decryptData) {
            /*
            data = {
                remitter(STK Người chuyển): String
                receiver(STK Người nhận): String
                deposit_money(tiền gửi): String
                description(Nội dung): String
                (Hình thức thanh toán)
                type_settle: Number - gửi or nhận trả
                billing_cost(Chi phí): String
            }
            */
            try {
                decryptData = JSON.parse(decryptData);
            } catch (error) {
                console.log(error);
            }

            const account = await bols.My_model.find_first('Consumer_credit', { account_number: decryptData.account_number }, 'account_id account_number', 'account_id');
            if (account) {
                const result = {
                    account_number: account.account_number,
                    name: account.account_id.name,
                    email: account.account_id.email,
                    phone: account.account_id.phone,
                };

                return res.status(200).json({ message: "Get success", data: result });
            }

            return res.status(400).json({ message: "Account number is not exist.", data: req.body });
        }

        return res.status(400).json({ message: "Error verify data.", data: req.body });
    }

    return res.status(400).json({ message: "Your banking not connect.", data: req.body });
});

module.exports = api_link_banking;