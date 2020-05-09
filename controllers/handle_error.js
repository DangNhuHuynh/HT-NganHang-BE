var express = require('express');
var handle = express.Router();
var db = require('./../models');
var bols = require('./../model_bols');

handle.get('/error/:code', function(req, res, next) {
    if(req.params.code == 404){
        res.sendStatus(404);
    }
});


module.exports = handle;
