var express = require('express');
var consumer_credit = express.Router();
var db = require('../models');
var bols = require('../model_bols');

/* GET home page. */
// consumer_credit.get('/', function (req, res, next) {
// });

consumer_credit.get('/me', function (req, res, next) {
    const user = req.user;
    
    const result = await bols.My_model.findById('Consumer_credit', user._id);
    if (result) {
        return res.status(200).json({ message: 'Get consumer credit success.', data: result });
    }

    return res.status(500).json({ message: `Account don't have consumer credit.`, data: {} });
});

module.exports = consumer_credit;