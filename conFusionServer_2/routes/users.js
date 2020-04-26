//for handling user details requirements
//it extends user schema
var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
//passport for authentication
var passport = require('passport');
//for using toekn for authentication
var authenticate = require('../authenticate');
const cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});


//router for user signup, using passport
router.post('/signup', cors.corsWithOptions, (req, res, next) => {

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
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {

  //creating token for authentication apart from auther authentication method(local strategy)\
  //getToken is defined in authenticate.js, here we give payload as id only
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //passing back token to the user in response
  res.json({success: true, token: token, status: 'You are successfully loged in'});

});


//for logout we don't need to supply any information, that why get method is used
router.get('/logout', cors.corsWithOptions, (req, res) => {

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

//for signup using facebook account
//authenticate takes strategy by which authentication done, here facebook-token
//if authenticate successful, it will add user in request parameter
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  //check authenticated or not
  if (req.user) {

    //creating Json web token for client to make authenticated request to server
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});


module.exports = router;
