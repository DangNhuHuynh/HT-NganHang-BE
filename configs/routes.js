var express = require('express');
var routes = express.Router();

var index = require('./../controllers/index');
routes.use('/', index);

var auth = require('../controllers/auth');
routes.use('/auth', auth);

var accounts = require('../controllers/account');
routes.use('/accounts', accounts);

//error
var handle_error = require('./../controllers/handle_error');
routes.use('/handle-error', handle_error);

module.exports = routes;