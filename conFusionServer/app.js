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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//using cookie-parser middleware with singed key
//key can be any string
//app.use(cookieParser('12345-67890-09876-54321'));

//using session in place of cookieparser
//for session based authentication
/*app.use(session({

  //defining parameters for the session
  //name of the session
  name: 'session-id',
  //secret id
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));*/

app.use(passport.initialize());
//for session based authentication
//app.use(passport.session());

//these to routes acessed without authorization, so above the auth middleware
app.use('/', indexRouter);
app.use('/users', usersRouter);

//this is used for authentication at all roots, using passport
/*function auth (req, res, next) {

  //req.user added by passport
  if (!req.user) {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    next(err);
  }
  else {

    //if user presnt in body, then pass control to next middleware
    next();
  }
}*/


//this funcion is used as middleware in this application for authorization
//uses express session for traking user information
/*function auth(req, res, next) {
   
  //printing user session information
  console.log(req.session);

  //this part uses user.js for authenticating
  //now check if request contains session information or not
  if(!req.session.user) {

    //create error as no session information included in request
    var err = new Error('You are not authenticated!');
    err.status = 403;
    return next(err);
  }
  else {

    //session information is present in request
    //now verify session information to give permission to user
    if (req.session.user === 'authenticated') {
      next();
    }
    else {

      //req.session.user value is not authenticated then enter here
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
    }
  }
  

  //using session for signing
  //this part check for session information in request
  if (!req.session.user) {

    //here means no session in request
    //get authorization headers from the request
    var authHeader = req.headers.authorization;

    //now check if request contains authorization headers or not
    if (!authHeader) {

      //if not then challenge user to provide authorization details
      var err = new Error('You are not authenticated!');

      //set headers for providing authentication
      res.setHeader('WWW-Authenticate', 'Basic');              
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];

    if (user == 'admin' && pass == 'password') {

      //as no session is present, setting up session
      req.session.user = 'admin';
      next();

    } else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');              
      err.status = 401;
      next(err);
    }
  }
  else {

    //if session exit in request
    //check if session is valid or not
    if (req.session.user === 'admin') {
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 401;
      next(err);
    }
  }



  //sing cookies for signing
  //print request headers just to see what is coming from user
  //console.log(req.headers);

  //printing signed cookies information
  /*console.log(req.singedCookies);

  //this part uses singed cookies for authorization
  //check if request contains signed cookies field
  if (!req.signedCookies.user) {

    //here means no signed cookies in request
    //this is for username and password from database
    //get authorization headers from the request
    var authHeader = req.headers.authorization;

    //now check if request contains authorization headers or not
    if (!authHeader) {

      //if not then challenge user to provide authorization details
      var err = new Error('You are not authenticated!');

      //set headers for providing authentication
      res.setHeader('WWW-Authenticate', 'Basic');              
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];

    if (user == 'admin' && pass == 'password') {

      //as no cookies are present, setting up cookies
      /here cookies contains username and password, and cookies are signed
      //res.cookie('user','admin',{signed: true});
      req.session.user = 'admin';
      next(); // authorized
    } else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');              
      err.status = 401;
      next(err);
    }
  }
  else {

    //if cookies exit in request
    //check if cookie is valid or not
    //if (req.signedCookies.user === 'admin') {
    if (req.session.user === 'admin') {
        next();
    }
    else {
        var err = new Error('You are not authenticated!');
        err.status = 401;
        next(err);
    }
  }

  //this part is for default user name and password
  //get authorization headers from the request
  //this is basic authentication, without using cookies
  //so we have to expilcitly pass the headers in each request
  /* var authHeaders = req.headers.authorization;

  //now check if request contains authorization headers or not
  if (!authHeaders) {
    err = new Error('Yor Are Not Authenticated');

    res.setHeader('WWW-Authenticate', 'Basic');
    res.statusCode = 401;
    return next(err);
  }

  //if authorization details are present in request
  //then extract the user name and password from the request headers
  //split by " ", left of this contains encode type and 
  //right of it contains encoded string of username and password, here encoding is of base64
  //username and password are seperated by : this, so after decoding split the string by :
  var auth = new Buffer.from(authHeaders.split(' ')[1], 'base64').toString().split(':');
  var user = auth[0];
  var pass = auth[1];

  //using default username and password just for checking
  if (user == 'admin' && pass == 'password') {

      //as user is authorized so allow login
      //this next will pass request to next middleware following auth middleware
      next();
  } else {

      //if not valid authorized then ask user to authenticate first
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');      
      err.status = 401;
      next(err);
  }

}*/

//this is auth middleware for authentication
//it uses auth function that is defined just above it
//app.use(auth);


//everything below this must go through authorisation
//middlewares are applied insame order as they are defined
//so all middlewares below authorization one will require authorization middleware to be satisfied
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

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
