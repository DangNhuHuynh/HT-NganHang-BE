var express = require('express');
var routes = express.Router();
var middleware = require('./middlewware');

var index = require('./../controllers/index');
routes.use('/', index);

var auth = require('../controllers/auth');
routes.use('/auth', auth);

var user = require('../controllers/user');
routes.use('/user', user);

var account = require('../controllers/account');
routes.use('/account', middleware.mdwAuth, account);

var employee = require('../controllers/employee');
routes.use('/employee', middleware.mdwAuth, employee);

var customer = require('../controllers/customer');
routes.use('/customer', middleware.mdwAuth, customer);

var link_banking = require('../controllers/link_banking');
// routes.use('/link_banking', middleware.mdwAuth, link_banking); // TODO
routes.use('/link_banking', link_banking);

var list_receiver = require('../controllers/list_receiver');
routes.use('/list_receiver', middleware.mdwAuth, list_receiver);

var transfer_money = require('../controllers/transfer_money');
routes.use('/transfer_money', middleware.mdwAuth, transfer_money);

var transaction_history = require('../controllers/transaction_history');
routes.use('/transaction_history', middleware.mdwAuth, transaction_history);

var debt_reminder = require('../controllers/debt_reminder');
routes.use('/debt_reminder', middleware.mdwAuth, debt_reminder);

var api_link_banking = require('../controllers/api_link_banking');
routes.use('/link-api', api_link_banking);

if (process.env.NODE_ENV === 'dev') {
  var test = require('../controllers/test_controller');
  routes.use('/test', test);
}

//error
var handle_error = require('./../controllers/handle_error');
routes.use('/handle-error', handle_error);

module.exports = routes;
