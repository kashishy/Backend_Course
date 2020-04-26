const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//for token based authentication
const authenticate = require('../authenticate');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
//for handling cross origin resource sharing
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })//for sending options to server before actual request
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    //cors applied in start so to handle cross origin resource sharing

    //finding document in favorite collection with user = current user id
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')   //for mongoose population
    .then((favorites) => {
        res.statusCode = 200; 
        //as output is of json form
        res.setHeader('Content-Type','application/json');
        //send response in json form
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})


//if verifyUser funtion returns true then only other funtion execute
//verifyuser is used to verify the user based on token it has
//parameters are executed in same sequence as they are define
//cors is for handling cross origin resource sharing
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    //find the document of current user in favorite collection
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {

        //check document present or not
        if (favorite) {

            //document of current user exits
            //now add dish id from the request body in the dishes array
            //also check if it is already present or not
            for (var i=0; i<req.body.length; i++) {

                if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            //saving updated document back to collection
            favorite.save()
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err)); 
        }
        else {

            //this if document of current user does not exit in favorite collection
            //create a document for current user
            Favorites.create({"user": req.user._id, "dishes": req.body})
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    //find the document of current user and remove it completely
    Favorites.remove({user: req.user._id})
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//this end point if dishID passed in url instead of request body
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {

    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    //push dish in the dishes array of the document
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {

        if(favorite) {
            
            if(favorite.dishes.indexOf(req.params.dishId) === -1)
            {
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err)); 
            }
        }
        else {
            favorite.create({"user": req.user._id, "dishes": [req.params.dishId]})
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})  
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    //find document of current user
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {

        //check document exits or not
        if(favorite) {

            //document exit, now check if given dish id exits in dishes array
            var index = favorite.dishes.indexOf(req.params.dishId);
            if(index != -1)
            {
                //dish id exit of given dish in dishes array
                //remove that dish id from dishes array
                favorite.dishes.splice(index, 1);
                //save back updated dish
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Deleted ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;