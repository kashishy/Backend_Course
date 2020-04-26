//using passport for authentication
var passport = require('passport');
//for local strategy of authentication
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
//for json web tokens based authentication using passport
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
//for using json web token
var jwt = require('jsonwebtoken');

//importing configuration file for server
var config = require('./config');

//extracting username and passport details from the request body and verifying it
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//this is used for using sessions for tracking users
//it stores user id in session, result of this method attached to the req parameter
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//used for creating json web token
//here user is a json object
exports.getToken = function(user) {

    //it has three parameters, 1st is user details, 2nd is secret key for encoding from congif.js module
    //3rd is expiry time of token
    return jwt.sign(user, config.secretKey,
        {expiresIn: 36000});
};


//options for jwt strategy
var opts = {};
//this tell how jwt extracted from incoming request. many ways are availeble to extract token,
//here we are using formauthheaderasbrearertoken
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//passing secret key that will be used in strategy
opts.secretOrKey = config.secretKey;


//json web token passport strategy
//it taks two parameters 1st is options(containing options to control how the token is extracted from the request or verified),
//2nd is verify function with payload(containing the decoded JWT payload) and 
//done is callback provided by passport when inside function called
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {

        //printing payload
        console.log("JWT payload: ", jwt_payload);

        //serching user with the given id
        User.findOne({_id: jwt_payload._id}, (err, user) => {

            //done takes three parameters, 3rd is optional, 1st is error, 2nd is user if exits
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

//it is used to verify incoming user
//session: false as we are using token based authentication not session based
//here jwt is the strategy, session is false as no session is created
//it takes token from incoming request and verify it
exports.verifyUser = passport.authenticate('jwt', {session: false});


/*exports.verifyAdmin = function(req, res, next) {
    User.findOne({_id: req.user._id})
    .then((user) => {
        console.log("User: ", req.user);
        if (user.admin) {
            next();
        }
        else {
            err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        } 
    }, (err) => next(err))
    .catch((err) => next(err))
} */
    //for checking admin permission
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
      var err = new Error('Only administrators are authorized to perform this operation.');
      err.status = 403;
      next(err);
    }
}