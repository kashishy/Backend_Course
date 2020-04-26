const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//for token based authentication
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();
//for handling cross origin resource sharing
const cors = require('./cors');

dishRouter.use(bodyParser.json());

//get will be open for all users, no need of authentication
//token based authentication
//using mongoose population for populating authorin comments of dish
dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })//for sending options to server before actual request
.get(cors.cors, (req,res,next) => {
    //cors applied in start so to handle cross origin resource sharing

    Dishes.find({})
    .populate('comments.author')   //for mongoose population
    .then((dishes) => {
        res.statusCode = 200; 
        //as output is of json form
        res.setHeader('Content-Type','application/json');
        //send response in json form
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
//if verifyUser funtion returns true then only other funtion execute
//verifyuser is used to verify the user based on token it has
//parameters are executed in same sequence as they are define
//authenticate.verifyAdmin
//cors is for handling cross origin resource sharing
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    //request body contains the document that needs to be created
    //o we have to pass that body as parameter to the function
    Dishes.create(req.body)
    .then((dish) => {
        
        //printing the created dish
        console.log('Dish Created',dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        //returning the created dish to the user, so users can deal with that
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//same as dished endpoint
dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {

    Dishes.findById(req.params.dishId)
    .populate('comments.author')    //for mongoose population
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, {new: true})
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})  
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//same as above for verifying user using token
dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')   //for mongoose population
    .then((dish) => {
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            //for assinging user id into author feild of comment that can be used to retrieve author information
            //as this information will not be present in body
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {

                //this is to populate author in comments
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);   
                })             
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+'/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            for (var i = dish.comments.length -1; i>=0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err));

        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {

    Dishes.findById(req.params.dishId)
    .populate('comments.author')  //for mongoose population
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
           res.statusCode = 200;
           res.setHeader('Content-Type', 'application/json');
           res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
           err = new Error('Dish '+req.params.dishId+' not found');
           err.status = 404;
           return next(err);
        }
        else {
        err = new Error('Comment '+req.params.dishId+' not found');
        err.status = 404;
        return next(err);
       }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId +'/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null &&
        dish.comments.id(req.params.commentId).author.equals(req.user.id)) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id) // used for populating author comments
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish '+req.params.dishId+' not found');
            err.status = 404;
            return next(err);
        }
        else if(dish.comments.id(req.params.commentId) == null) {
         err = new Error('Comment '+req.params.dishId+' not found');
         err.status = 404;
         return next(err);
        }
        else {
            err = new Error('You are not authorized to update this comment!');
            err.status = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})  
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null &&
        dish.comments.id(req.params.commentId).author.equals(req.user.id)) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id) // used for populating author comments
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })
            }, (err) => next(err));

        }
        else if (dish == null) {
            err = new Error('Dish '+req.params.dishId+' not found');
            err.status = 404;
            return next(err);
        }
        else if(dish.comments.id(req.params.commentId) != null) {
         err = new Error('Comment '+req.params.dishId+' not found');
         err.status = 404;
         return next(err);
        }
        else {
            err = new Error('You are not authorised to delete this comment!');
            res.statusCode = 403;
            return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
});


module.exports = dishRouter;