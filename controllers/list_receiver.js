var express = require('express');
var list_receiver = express.Router();
var db = require('../models');
var bols = require('../model_bols');

list_receiver.get('/me', async function (req, res, next) {
    const user = req.user;

    const result = await bols.My_model.findAll('List_receiver', { created: req.username });
    if (result) {
        return res.status(200).json({ message: 'Get consumer credit success.', data: result });
    }

    return res.status(500).json({ message: `Account don't have consumer credit.`, data: {} });
});

// Create 1 receiver.
list_receiver.post('/', async function (req, res, next) {
    const user = req.user;
    req.checkBody("account_number", "Số TK không được trống.").notEmpty();
    req.checkBody("banking_id", "Vui lòng chọn Banking.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ message: errors, data: req.body });
    } else {
        const { account_number, banking_id, name_reminiscent } = req.body;
        if (name_reminiscent.trim().length == 0) {
            const link_bank = await bols.My_model.findById('Link_banking', banking_id);
            if (link_bank.name.toLowerCase() == 'hpk') {
                const creditReceiver = await bols.My_model.find_first('Consumer_credit', { account_number }, '', 'account_id');
                if (creditReceiver) {
                    var data = req.body;
                    data['name_reminiscent'] = createReceiver.account_id.name;

                    const createReceiver = await bols.My_model.create(req, 'List_receiver', data);
                    if (createReceiver.status == 200) {
                        return res.status(200).json({ message: 'Create Receiver success.', data: createReceiver.data });
                    }

                    return res.status(500).json({ message: 'Create Receiver fail.', data: req.body });
                }

                return res.status(400).json({ message: 'Account number not found.', data: req.body });
            } else {
                // Trường hợp user thuộc ngân hàng liên kết.

            }
        } else {
            var data = req.body;

            const createReceiver = await bols.My_model.create(req, 'List_receiver', data);
            if (createReceiver.status == 200) {
                return res.status(200).json({ message: 'Create Receiver success.', data: createReceiver.data });
            }

            return res.status(500).json({ message: 'Create Receiver fail.', data: req.body });
        }

    }
});

list_receiver.put('/', async function (req, res, next) {
    req.checkBody("receiver_id", "Vui lòng cung cấp receiver_id.").notEmpty();
    req.checkBody("name_reminiscent", "Vui lòng nhập tên gợi nhớ.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ message: errors, data: req.body });
    } else {
        const { receiver_id, name_reminiscent } = req.body;
        const createReceiver = await bols.My_model.update(req, 'List_receiver', { _id: receiver_id }, { name_reminiscent }, false);
        if (createReceiver.status == 200) {
            return res.status(200).json({ message: 'Update Receiver success.', data: createReceiver.data });
        }

        return res.status(500).json({ message: 'Update Receiver fail.', data: createReceiver.data });
    }
});

list_receiver.delete('/', async function (req, res, next) {
    req.checkBody("receiver_id", "Vui lòng cung cấp receiver_id.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ message: errors, data: req.body });
    } else {
        const { receiver_id } = req.body;

        const deleteReceiver = await bols.My_model.delete('List_receiver', { _id: receiver_id });
        if (deleteReceiver.status == 200) {
            return res.status(200).json({ message: 'Delete Receiver success.', data: createReceiver.data });
        }

        return res.status(500).json({ message: 'Delete Receiver fail.', data: createReceiver.data });
    }
});

module.exports = list_receiver;
