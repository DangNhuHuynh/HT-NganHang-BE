var express = require('express');
var employeeRouter = express.Router();
var db = require('../models');
var bols = require('../model_bols');
var ObjectId = require('mongoose').Types.ObjectId;
var EmployeeModel = require('../models/employee')

employeeRouter.get('', async function (req, res, next) {
  const employees = await EmployeeModel
    .find()
    .populate({
      path: 'account_id',
    })

  const data = employees.map(employee => {
    const account = employee.account_id // populate field
    return {
      id: employee._id,
      ma_nv: employee.ma_nv,
      name: employee.name,
      phone: employee.phone,
      id_card: employee.id_card,
      email: account.email,
      position: employee.position,
      department: employee.department,
    }
  })

  return res
    .status(200)
    .json({ message: 'Get employee success.', data });
});

employeeRouter.post('', async function (req, res, next) {
  req.checkBody("ma_nv", "Vui lòng nhập mã nhân viên").notEmpty();
  req.checkBody("name", "Vui lòng nhập họ tên").notEmpty();
  req.checkBody("id_card", "Vui lòng nhập id card").notEmpty();
  req.checkBody("email", "Vui lòng nhập email").notEmpty();
  req.checkBody("position", "Vui lòng nhập position").notEmpty();
  req.checkBody("phone", "Vui lòng nhập phone").notEmpty();
  req.checkBody("department", "Vui lòng nhập department").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.json(errors);
  }

  var [existsUser, existsEmployee] = await Promise.all([
    bols.My_model.find_first('Account', {email: req.body.email, account_type: 2}),
    bols.My_model.find_first('Employee', {ma_nv: req.body.ma_nv})
  ])
  if (existsUser) {
    return res.status(400).json({message: 'Email is exist.', data: req.body});
  }
  if (existsEmployee) {
    return res.status(400).json({message: 'Ma_nv is exist.', data: req.body});
  }

  var account = await bols.My_model.create(req, 'Account', {
    username: req.body.ma_nv,
    password: '123456',
    email: req.body.email,
    account_type: 2,
  });
  var employee = await bols.My_model.create(req, 'Employee', {
    account_id: new ObjectId(account.data._id),
    ...req.body
  });

  return res
    .status(200)
    .json({ message: 'Create employee success.', data: req.body });
});

employeeRouter.put('/:id', async function (req, res, next) {
  req.checkBody("ma_nv", "Vui lòng nhập mã nhân viên").notEmpty();
  req.checkBody("name", "Vui lòng nhập họ tên").notEmpty();
  req.checkBody("id_card", "Vui lòng nhập id card").notEmpty();
  req.checkBody("email", "Vui lòng nhập email").notEmpty();
  req.checkBody("position", "Vui lòng nhập position").notEmpty();
  req.checkBody("phone", "Vui lòng nhập phone").notEmpty();
  req.checkBody("department", "Vui lòng nhập department").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.json(errors);
  }

  var [user, employee] = await Promise.all([
    bols.My_model.find_first('Account', {email: req.body.email, account_type: 2}),
    bols.My_model.find_first('Employee', {ma_nv: req.body.ma_nv})
  ])
  if (!user || !employee) {
    return res.status(400).json({message: 'Employee doesn\'n exist.', data: req.body});
  }

  Object.assign(user, {
    email: req.body.email,
  })
  Object.assign(employee, req.body)

  await Promise.all([
    user.save(),
    employee.save(),
  ])

  return res
    .status(200)
    .json({ message: 'Update employee success.', data: {} });
});

employeeRouter.delete('/:id', async function (req, res, next) {
  const id = req.params.id

  const employee = await bols.My_model.find_first('Employee', { _id: new ObjectId(id) })
  if (!employee) {
    return res.status(400).json({message: 'Employee doesn\'n exist.', data: req.body});
  }

  await Promise.all([
    bols.My_model.delete('Employee', { _id: new ObjectId(id) }),
    bols.My_model.delete('Account', { _id: new ObjectId(employee.account_id) }),
  ])

  return res
    .status(200)
    .json({ message: 'Delete employee success.', data: {} });
});

module.exports = employeeRouter;
