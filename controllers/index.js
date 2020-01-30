var express = require('express');
var index = express.Router();


/* GET home page. */
index.get('/', function(req, res, next) {
  res.render('index', { contend: "Xin chao be" });
});

index.get('/messenger', function(req, res, next) {
  res.send('message');
});

module.exports = index;