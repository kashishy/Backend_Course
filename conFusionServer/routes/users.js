//for handling user details requirements
//it extends user schema
var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
//passport for authentication
var passport = require('passport');
//for using toekn for authentication
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

console.log("Users Ruter");
/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});


//router for user signup, using passport
router.post('/signup', (req, res, next) => {

  //passport plugin in user schema provides register function
  //first parameter is username, 2nd is password then callback function
  //here promise not supported so we have to handle callback function
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {

    //if error occured in creating new user
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      //constructing json object with error value in response
      res.json({err: err});
    }
    else {

      //when user created successfully
      //set user first and last name
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;

      //now save user after modification
      user.save((err, user) => {
        //if error occured in saving new user
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }

        //when no error occured in saving new user, now authenticate the new user
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      })
    }
  });
});

//used for authenticating user(by local strategy), using passport
//if passport.auth(local) satisfied in fucntion call then only control will go to callback function
//otherwise reply will be sent to  client regarding failure of login
router.post('/login', passport.authenticate('local'), (req, res) => {

  //creating token for authentication apart from auther authentication method(local strategy)\
  //getToken is defined in authenticate.js, here we give payload as id only
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //passing back token to the user in response
  res.json({success: true, token: token, status: 'You are successfully loged in'});

  //without token, response to client
  //res.json({success: true, status: 'You are successfully logged in!'});
});


//router for user signup, withour using passport
/*router.post('/signup', (req, res, next) => {

  //check if username already exits in system or not, as duplicate usernames are not allowed
  User.findOne({username: req.body.username})
  .then((user) => {

    //now check user exit or not by checking the return value
    if(user != null) {

      //if not null then username already exits in system, so return error
      var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);
    }
    else {

      //as no username exit with given username, so create new user
      //new user will have username and password as passed in request body
      return User.create({
        username: req.body.username,
        password: req.body.password});
    }
  })
  //this is for creating new user
  .then((user) => {

    //new user created successfully
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});*/


//router for login user, without using passport
/*router.post('/login', (req, res, next) => {

  //check user authenticated or not
  //request has this parameter in it, check its value
  if(!req.session.user) {

    //not authenticated so first authenticate
    //get auth headers from the user request
    var authHeader = req.headers.authorization;
    
    //check if auth headers present or not
    if (!authHeader) {

      //auth header not present, so return a error asking first authenticate
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  
    //if authorization details are present in request
    //then extract the user name and password from the request headers
    //split by " ", left of this contains encode type and 
    //right of it contains encoded string of username and password, here encoding is of base64
    //username and password are seperated by : this, so after decoding split the string by :
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];
  
    //now check if given username exit in system
    User.findOne({username: username})
    .then((user) => {

      //now check returned value of findone function
      if (user === null) {

        //username not exit in system, so rise an error
        var err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      //check if password correct or not
      else if (user.password !== password) {

        //password not correct, so rise an error
        var err = new Error('Your password is incorrect!');
        err.status = 403;
        return next(err);
      }
      else if (user.username === username && user.password === password) {

        //username and password are correct, authenticate user session
        //set session.user value to authenticated rather than null, so that it can be check in start
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!')
      }
    })
    .catch((err) => next(err));
  }
  else {

    //auth session present so user already authenticated, user already logedin
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});*/


//for logout we don't need to supply any information, that why get method is used
router.get('/logout', (req, res) => {

  //check if session is already present or not
  if (req.session) {

    //destroy the present session, removes session information on seriver side
    req.session.destroy();

    //clear cookies from client of the present session, session-id is the name that we given to session cookies
    res.clearCookie('session-id');

    //redirecting the user to homepage
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
