var express = require("express");
var test_controller = express.Router();
var bols = require('../model_bols');

test_controller.post('', async function (req, res, next) {
  req.checkBody("email", "Vui lòng nhập lại email mới").notEmpty();
  req.checkBody("password", "Vui lòng nhập password").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.json(errors);
  }

  // OK, update new password
  const data = {
    password: req.body.password,
  };
  const uPassword = await bols.My_model.update(req, 'Account', { email: req.body.email }, data, false);
  if (uPassword.status == 200) {
    return res.status(200).json({message: 'Update password success.', data: {}});
  } else {
    return res.status(500).json({message: uPassword.data, data: {}});
  }
})

module.exports = test_controller;
