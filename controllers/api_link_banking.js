const express = require('express');
const router = express.Router();
const bols = require('../model_bols');
const middleware = require('../configs/middlewware')

router.post('/account', middleware.linkApiVerifyWithHash, async function (req, res, next) {
  return res.json({ message: 'OK', data: {} })
});

module.exports = router;
