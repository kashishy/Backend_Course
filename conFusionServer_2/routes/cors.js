const express = require('express');
//for cross origin sharing resource configuration
const cors = require('cors');
const app = express();

//list of origins that are allowed
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

//function for handling cors request
var corsOptionsDelegate = (req, callback) => {
    //it contains value of origin in response, true or false 
    //that tells browser either to allow request or not
    var corsOptions;

    console.log(req.header('Origin'));
    //checking for request origin present in whitelist or not
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        //allowed origin
        corsOptions = { origin: true };
    }
    else {
        //not alllowed origin
        corsOptions = { origin: false };
    }
    //return callback with error=null and allowed or not value
    callback(null, corsOptions);
};

//cors without any specific options
exports.cors = cors();
//cors with some specific options
exports.corsWithOptions = cors(corsOptionsDelegate);