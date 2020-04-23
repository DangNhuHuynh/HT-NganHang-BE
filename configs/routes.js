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
routes.use('/account', middleware.mdw_auth, account);

var employee = require('../controllers/employee');
routes.use('/employee', middleware.mdw_auth, employee);

var link_banking = require('../controllers/link_banking');
routes.use('/link_banking', middleware.mdw_auth, link_banking);

var list_receiver = require('../controllers/list_receiver');
routes.use('/list_receiver', middleware.mdw_auth, list_receiver);

var transfer_money = require('../controllers/transfer_money');
routes.use('/transfer_money', middleware.mdw_auth, transfer_money);

var api_link_banking = require('../controllers/api_link_banking');
routes.use('/api_link_banking', middleware.mdw_auth, api_link_banking);

if (process.env.NODE_ENV === 'dev') {
  var test = require('../controllers/test_controller');
  routes.use('/test', test);
}

//error
var handle_error = require('./../controllers/handle_error');
routes.use('/handle-error', handle_error);

module.exports = routes;
