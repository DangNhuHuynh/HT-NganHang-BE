var express = require('express');
var auth_helper = express;
var db = require('./../models');
var bols = require('./../model_bols');
var bcrypt = require('bcrypt');

/**
 * @api {function} verify_user Get và verify thông tin user
 * @apiName verify_user
 * @apiDescription Lấy thông tin user để verify khi đăng nhập
 * @apiGroup auth_helper
 * @apiVersion 1.0.0
 * @apiParam {String} username Thông tin username.
 * @apiParam {String} password Thông tin password.
 *
 */

auth_helper.verify_user = async function (username, password) {
  var user = await bols.Manage_user.find_by_username('Account', username);
  if (user != null) {
    // TODO: bcrypt
    const match = bcrypt.compareSync(password + config.app.secretKey, user.password);
    console.log(match)
    // const match = password === user.password
    if (match == true) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

auth_helper.find_user_by_email = async function (email) {
  return bols.Manage_user.find_by_email('Account', email);
}

/**
 * @api {function} delete_userdata Delete user data
 * @apiName delete_userdata
 * @apiDescription Destroy session khi user logout
 * @apiGroup auth_helper
 * @apiVersion 1.0.0
 * @apiParam {Object} req Thông tin request.
 *
 */

auth_helper.delete_userdata = async function (req) {
  req.session.destroy();
}

/**
 * @api {function} set_local_user_data Set local show template
 * @apiName set_local_user_data
 * @apiDescription Set data user vào biến locals để show ra template
 * @apiGroup auth_helper
 * @apiVersion 1.0.0
 * @apiParam {Object} res Thông tin response.
 *
 */
auth_helper.set_local_user_data = async function (res, user_data) {
  res.locals.user_data = user_data;//set local data user
}

/**
 * @api {function} get_userdata Lấy thông tin user
 * @apiName get_userdata
 * @apiDescription lấy thông tin user từ session để sử dụng
 * @apiGroup auth_helper
 * @apiVersion 1.0.0
 * @apiParam {Object} req Thông tin request.
 *
 */
auth_helper.get_userdata = async function (req) {
  if (req.session.userdata != null && req.session.userdata != undefined) {
    var obj = req.session.userdata;

    if (req.session.permission != null && req.session.permission != undefined) {
      obj.permission = req.session.permission;
    } else {
      obj.permission = null;
    }
    return obj;
  } else {
    return null;
  }
}


/**
 * @api {function} is_authenticated Check user đăng nhập
 * @apiName is_authenticated
 * @apiDescription Kiểm tra user có đăng nhập hay chưa
 * @apiGroup auth_helper
 * @apiVersion 1.0.0
 * @apiParam {Object} req Thông tin request.
 *
 */
auth_helper.is_authenticated = async function (req) {
  if (req.session.userdata != null && req.session.userdata != undefined) {
    return true;
  } else {
    //console.log('0');
    return false;
  }
}

module.exports = auth_helper;
