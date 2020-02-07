var express = require('express');
var api_link_banking = express.Router();


/* GET home page. */
api_link_banking.get('/account', function (req, res, next) {
    const { data } = req.body;
    var decryptData = helpers.hash_helper.decrypedRSA(data);
    try {
        decryptData = JSON.parse(decryptData);
    } catch (error) {
        console.log(error);
    }
});

module.exports = api_link_banking;