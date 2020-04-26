var createError = require('http-errors');
var express = require('express');
var path = require('path');
//cookie parser for using cookieinformation in our server
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
//it is used for traking session on server side
var session = require('express-session');
//this is used for storing session information on server side
var FileStore = require('session-file-store')(session);
//passport for authentication purpose
var passport = require('passport');
var authenticate = require('./authenticate');
//for json web tokens
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favoriteRouter');

//importing model file
const Dishes = require('./models/dishes');

//dynamic url from config file
const url = config.mongoUrl;

//this is static url
//const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

//connecting to the server
connect.then((db) => {
  console.log('Connected correctly to server');
},(err) => { console.log(err)});

var app = express();

//for redirecting http(unsecure) request to https(secure)
//for all request
app.all('*', (req, res, next) => {

  //check if incoming request already a secure request
  //secure request will have a secure parameter in it
  if(req.secure){
    //already secured so nothing required to do
    //send control forward
    return next();
  }
  else{

    //redirect request to secure channel
    //307 is target resource
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());


//these to routes acessed without authorization, so above the auth middleware
app.use('/', indexRouter);
app.use('/users', usersRouter);

//everything below this must go through authorisation
//middlewares are applied insame order as they are defined
//so all middlewares below authorization one will require authorization middleware to be satisfied
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
