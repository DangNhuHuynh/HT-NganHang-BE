var express = require('express');
var routes = express.Router();
var middleware = require('./middlewware');

var index = require('./../controllers/index');
routes.use('/', index);

var auth = require('../controllers/auth');
routes.use('/auth', auth);

var accounts = require('../controllers/account');
routes.use('/accounts', accounts);

var consumer_credits = require('../controllers/consumer_credit');
routes.use('/consumer_credits', middleware.mdw_auth, consumer_credits);

var saving_accounts = require('../controllers/saving_account');
routes.use('/saving_accounts', middleware.mdw_auth, saving_accounts);
//error
var handle_error = require('./../controllers/handle_error');
routes.use('/handle-error', handle_error);

module.exports = routes;