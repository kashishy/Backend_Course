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
//for signing with facebook in app
var FacebookTokenStrategy = require('passport-facebook-token');

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

//function for integerating facebook auth
//1st parameter takes clientid and secret key that provided by facebook for app
//2nd parameter is callback function, which also takes callback function
//profile parameter comes from facebook that contains lot of information about user
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {

    //for checking if this user already exits
    //check facebook id database, based on id from profile parameter
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            //error in finding user, return callback fucntion with error and false
            return done(err, false);
        }
        if (!err && user !== null) {
            //user found in database, return null in error and user varaible
            return done(null, user);
        }
        else {
            //no user exits, so we have to create new user account on server
            //asing the user details from profile parameter
            user = new User({ username: profile.displayName });
            console.log(profile);
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            //save newely created user account
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));