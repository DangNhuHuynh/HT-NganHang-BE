const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const validator = require('express-validator')
const helmet = require('helmet')
const cors = require('cors')
const env = process.env.NODE_ENV//production, dev

const app = express()

app.use(express.json({
  limit: '30mb'
}))
app.use(express.urlencoded({
  extended: true,
  limit: '30mb'
}))
app.use(cookieParser())

//init root folder
global.__base = __dirname + '/'

//config && cors
if (env != 'production') {
  global.config = require('./configs/configdev')
  cors()
}
else {
  global.config = require('./configs/config')
}

//cors
var whitelist_domain = config.cors.whitelist
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(whitelist_domain))


//helpers
global.helpers = require('./helpers')

//locals config
app.locals.appName = config.app.appName

//frontend meta
app.locals.pageTitle = 'Học cùng bé'
app.locals.pageDes = 'Luôn bên bé và học cùng bé'
app.locals.pageImage = 'http://icons.iconarchive.com/icons/google/noto-emoji-animals-nature/1024/22246-elephant-icon.png'

//Biến static và baseurl cho trường hợp refix
global.__baseUrl = ''
global.__staticUrl = ''
app.locals.baseUrl = config.app.baseUrl
__baseUrl = config.app.baseUrl
app.locals.staticUrl = config.app.staticUrl
__staticUrl = config.app.staticUrl

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
}))

//validator
app.use(validator())

//helmet
app.use(helmet())
app.use(helmet.xssFilter())

//app middleware tổng của app
var mdw_app = (function (req, res, next) {
  app.locals.scriptGlobal = '<script>var baseUrl="' + __baseUrl + '"var staticUrl="' + __staticUrl + '"</script>'
  //recaptcha
  res.locals.recaptcha = {
    sitekey: config.recaptcha.sitekey,
    secretkey: config.recaptcha.secretkey,
  }

  //Get & Post para,
  res.locals.appPostParam = req.body
  res.locals.appGetParam = req.query

  next()
})


app.use(__baseUrl + '/public', express.static(path.join(__dirname, 'public')))
app.use(__baseUrl + '/medias', express.static(path.join(__dirname, 'medias')))

const logRequestStart = (req, res, next) => {
  var nowRequest = Date.now()
  const { method, originalUrl } = req

  res.on('finish', () => {
    var finishRequest = Date.now()
    console.info(`${method} ${originalUrl}: ${res.statusCode} ${res.statusMessage} ${finishRequest - nowRequest}ms`)
  })
  next()
}
app.use(logRequestStart)

//route
var indexRouter = require('./configs/routes')
app.use(__baseUrl + '/', mdw_app, indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  helpers.helper.show_404(res)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json(err)
})

//port
app.listen(config.app.port)


module.exports = app
