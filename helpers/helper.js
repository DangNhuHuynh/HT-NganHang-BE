var express = require('express');
var helper = {};
var bols = require('./../model_bols');
var moment = require('moment');
var nconf = require('nconf');
var nJwt = require('njwt');
nconf.argv().env().file({ file: __base + 'config_setting/config.json' });

// payload = {
//     a: 'asd',
//     b: 'asdqwe',
//     ...
// }
// Time tính theo ngày
helper.renderToken = function (secretKey, payload, time = 1) {
    // create signingKey
    var signingKey = secretKey;

    // Payload
    var claims = payload;

    var jwt = nJwt.create(claims, signingKey);

    // Thời hạn 1h
    var expire = new Date().getTime();
    expire = expire + time * 24 * 60 * 60 * 1000;
    // jwt tự chia lại cho 1000
    jwt.setExpiration(expire);

    // Token
    var token = jwt.compact();

    return token;
}

helper.randomString = function(characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', length) {
    var result = '';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = helper;
