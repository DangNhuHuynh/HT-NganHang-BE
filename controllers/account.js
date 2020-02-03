var express = require("express");
var account = express.Router();
var db = require('../models');
var bols = require('../model_bols');

// account.get("/", async function (req, res) {

// });

account.get("/:username", async function (req, res) {
    const { username } = req.params;
    if (username.trim().length > 0) {
        const result = await bols.My_model.find('Account', { username }, 'username name phone email');

        if (result.length > 0) {
            return res.status(200).json({ message: 'Find account success.', data: result[0] });
        } else {
            return res.status(500).json({ message: 'Find account error.', data: req.params });
        }
    }

    return res.status(400).json({ message: 'Username error.', data: req.params });
});

account.post("/", async function (req, res) {
    req.checkBody("username", "Vui lòng nhập tài khoản").notEmpty();
    req.checkBody("password", "Vui lòng nhập mật khẩu").notEmpty();
    req.checkBody("name", "Vui lòng nhập mật khẩu").notEmpty();
    req.checkBody("email", "Vui lòng nhập mật khẩu").notEmpty();
    req.checkBody("phone", "Vui lòng nhập mật khẩu").notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.json(errors);
    } else {
        const username = req.body.username;
        var checkUnitUsername = await bols.My_model.find('Account', { username }, 'username status');
        if (checkUnitUsername.length === 0) {
            var data = req.body;
            data.password = data.password + config.app.secretKey;
            var createAccount = await bols.My_model.create(req, 'Account', data);
            if (createAccount.status == 200) {
                delete (createAccount.password);
                return res.status(200).json({ message: 'Create account success.', data: createAccount });
            } else {
                return res.status(500).json({ message: createAccount.data, data: req.body });
            }
        } else {
            // Tồn tại username
            delete (req.body.password);
            return res.status(400).json({ message: 'Username is exist.', data: req.body });
        }
    }
});

account.put("/accountId", async function (req, res) {


    return null;
});

module.exports = account;
