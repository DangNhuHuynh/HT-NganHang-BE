var express = require('express');
var consumer_credit = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId; 

/* GET home page. */
// consumer_credit.get('/', function (req, res, next) {
// });

consumer_credit.get('/me', async function (req, res, next) {
    const user = req.user;
    console.log(user);

    const result = await bols.My_model.find_all('Consumer_credit', { account_id: new ObjectId(user._id) });
    console.log(result);
    
    if (result.length) {
        return res.status(200).json({ message: 'Get consumer credit success.', data: result });
    }

    return res.status(500).json({ message: `Account don't have consumer credit.`, data: {} });
});

module.exports = consumer_credit;