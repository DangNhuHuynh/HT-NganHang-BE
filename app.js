var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('express-flash');
var validator = require('express-validator');
var helmet = require('helmet');
var csrf = require('csurf');
const cors = require('cors');
const fileUpload = require('express-fileupload');
var env = 'production';//production, dev

var app = express();

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json({
  limit: '30mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '30mb'
}));
app.use(cookieParser());

//init root folder
global.__base = __dirname + '/';

//config && cors
if(env != 'production'){
  global.config = require('./configs/configdev');  
  cors();  
}
else{  
  global.config = require('./configs/config');  
}

//cors
var whitelist_domain = config.cors.whitelist;
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(whitelist_domain));


//helpers
global.helpers = require('./helpers');

//locals config
app.locals.appName = config.app.appName;

//frontend meta
app.locals.pageTitle = 'Học cùng bé';
app.locals.pageDes = 'Luôn bên bé và học cùng bé';
app.locals.pageImage = 'http://icons.iconarchive.com/icons/google/noto-emoji-animals-nature/1024/22246-elephant-icon.png';

//Biến static và baseurl cho trường hợp refix
global.__baseUrl = ''
global.__staticUrl = '';
app.locals.baseUrl = config.app.baseUrl;
__baseUrl = config.app.baseUrl;
app.locals.staticUrl = config.app.staticUrl;
__staticUrl = config.app.staticUrl;

// session middleware
app.use(session({
  secret: 'kp@Nhqa#lovep213jklP', //key session
  resave: true,
  saveUninitialized: true,
  cookie: {
    path: '/',
    secure: false,
    maxAge: 3600000
  } //60 phút
}));

//flash
app.use(flash());

//validator
app.use(validator());

//helmet
app.use(helmet());
app.use(helmet.xssFilter());

//fileUpload
app.use(fileUpload({limits: { fileSize: 1 * 1024 * 1024 }})); //1MB

//app middleware tổng của app
var mdw_app = (function (req, res, next) {
  app.locals.scriptGlobal = '<script>var baseUrl="' + __baseUrl + '";var staticUrl="' + __staticUrl + '";</script>';
  //recaptcha
  res.locals.recaptcha = {
    sitekey: config.recaptcha.sitekey,
    secretkey: config.recaptcha.secretkey,
  };

  //Get & Post para,
  res.locals.appPostParam = req.body;
  res.locals.appGetParam = req.query;

  next();
});


app.use(__baseUrl + '/public', express.static(path.join(__dirname, 'public')));
app.use(__baseUrl + '/medias', express.static(path.join(__dirname, 'medias')));


//route
var indexRouter = require('./configs/routes');
app.use(__baseUrl + '/', mdw_app, indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  helpers.helper.show_404(res);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//port
// app.listen(config.app.port);


module.exports = app;