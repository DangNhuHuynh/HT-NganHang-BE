//Fie init db connection
var fs = require('fs');
var path = require('path');
var db = require('./../models');
var bols = {};
 
// import all file in this dir, except index.js
fs.readdirSync(__dirname)
.filter(function(file){
    return (file.indexOf('.js') !== 0) && (file !== 'index.js');
})
.forEach(function(file){
    var m = require(path.join(__dirname, file));
    var name = file.split('.')[0];
    var tmp = name.substr(1, name.length - 1);
    bols[name[0].toUpperCase() + tmp] = m;
});
 
module.exports = bols;