var express = require('express');
var link_banking = express.Router();
var db = require('../models');
var bols = require('../model_bols');

/* GET home page. */
// link_banking.get('/', function (req, res, next) {
// });

link_banking.get('/', async function (req, res, next) {
    const result = await bols.My_model.find_all('Link_banking', {}, '_id name transaction_fee');

    return res.status(200).json({ message: 'Get list banking success.', data: result });
});

module.exports = link_banking;
