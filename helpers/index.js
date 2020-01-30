//Fie init db connection
var fs = require('fs');
var path = require('path');
var db = require('./../models');
var helpers = {};

fs.readdirSync(__dirname)
.filter(function(file){
    return (file.indexOf('.js') !== 0) && (file !== 'index.js');
})
.forEach(function(file){
    var m = require(path.join(__dirname, file));
    var name = file.split('.')[0];
    var tmp = name.substr(1, name.length - 1);
    helpers[name[0] + tmp] = m;
});
 
module.exports = helpers;