var express = require('express');
var validation_helper = express;
var path = require('path');

validation_helper.is_phone = function(data){
    var r = /^\d{9,13}$/;
    return r.test(data);
}

validation_helper.is_email = function(data){
    var r = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/i;
    return r.test(data);
}


module.exports = validation_helper;
