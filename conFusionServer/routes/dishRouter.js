const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//for token based authentication
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

//get will be open for all users, no need of authentication
//token based authentication
//using mongoose population for populating authorin comments of dish
dishRouter.route('/')
.get((req,res,next) => {

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
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

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
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

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
.get((req, res, next) => {

    Dishes.findById(req.params.dishId)
    .populate('comments.author')    //for mongoose population
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.get((req,res,next) => {
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
.post(authenticate.verifyUser, (req, res, next) => {

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
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+'/comments');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.get((req, res, next) => {

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
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId +'/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req, res, next) => {
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
.delete(authenticate.verifyUser, (req, res, next) => {
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

//without token based authentication
/*dishRouter.route('/')
.get((req,res,next) => {

    //finding all the dishes in the collection
    Dishes.find({})
    .then((dishes) => {
        res.statusCode = 200; 

        //as documents are in json format
        res.setHeader('Content-Type','application/json');

        //returning resopnse as json because documents are in json
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {

    //request body contains the document that needs to be created
    //so we pass it as a parameter to create function
    Dishes.create(req.body)
    .then((dish) => {

        //printing the result returned after creation of dish
        console.log('Dish Created',dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        //return that result to the client so the client can deal with it
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {

    //removing all the dish documents from the collection
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


//now for a particular dish
dishRouter.route('/:dishId')
.get((req, res, next) => {

    //getting a dish that matches the given id,
    //given id is in req parameter
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res, next) => {

    //updating a particular dish by given id
    //request body contains the updated value so we will pass it as parameter to function
    //new: true will return the updated dish in response
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
.delete((req, res, next) => {

    //remove a particular dish that matches given id
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


//handling routes on sub document of dish document that is comments
dishRouter.route('/:dishId/comments')
.get((req,res,next) => {
    
    //first we find the dish with given id by findbyid method
    //this method will return the dish
    Dishes.findById(req.params.dishId)
    .then((dish) => {

        //now check if dish with given id present or not
        if (dish != null) {

            //if not null then dish with given id is present
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');

            //now return the comments of the dish in response as comments are required only
            res.json(dish.comments);
        }
        else {

            //if no dish found with given id, then return error message
            //creating new error with custom message, this error will be handled by app.js file
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {

    //first find the dish with given id
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {

            //if dish found, then push comment to dish
            dish.comments.push(req.body);

            //after pushing save it, and return updated dish
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err)); //this error if failed to save updated dish
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err)) //this error if dish not found
    .catch((err) => next(err)); //catching all errors
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+'/comments');
})
.delete((req, res, next) => {

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {

            //after finding required dish, now we have to delete all the comments of the dish
            //comments are deleted one by one
            for (var i = dish.comments.length -1; i>=0; i--) {
                
                //this is how we get access to sub document
                dish.comments.id(dish.comments[i]._id).remove();
            }

            //now save updated dish
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

//now to routes to a particular comment in a particular dish
dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) => {

    //get a particular dish first
    Dishes.findById(req.params.dishId)
    .then((dish) => {

        //then check first if dish found or not, if found,
        //then check for the comment with given id
        if (dish != null && dish.comments.id(req.params.commentId) != null) {

            //lif comment found with given id, then return it in response
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {

            //if dish not found with given id, create a custom error and return
            err = new Error('Dish '+req.params.dishId+' not found');
            err.status = 404;
            return next(err);
        }
        else {
            //f comment not found with given id, create custom error and return
            err = new Error('Comment '+req.params.dishId+' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId +'/comments/' + req.params.commentId);
})
.put((req, res, next) => {

    //find given id in database
    Dishes.findById(req.params.dishId)
    .then((dish) => {

        //check if dish exits and comment also exits
        if (dish != null && dish.comments.id(req.params.commentId) != null) {

            //now update current comment with given parameters in request body
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }

            //after updating save dish in database
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            })
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
.delete((req, res, next) => {

    //now removing comment in dish with given id
      Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp) => {

        //now check dish and comment with given id found
        if (dish != null && dish.comments.id(req.params.commentId) != null) {

            //now remove comment with given id
            dish.comments.id(req.params.commentId).remove();

            //after removing comment, save updated dish, and return dish back in response
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err));
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
});*/


/*dishRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send all the dishes to you!');
})
.post((req, res, next) => {
    res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
    res.end('Deleting all dishes');
});

dishRouter.route('/:dishId')
.get((req, res, next) => {
    res.end('Will send details of the dish : '+ req.params.dishId+ ' to you' );
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res, next) => {
    res.write('Updating the dish: ' + req.params.dishId + '\n');
    res.end('Will update the dish: ' + req.body.name + 
          ' with details: ' + req.body.description);
})  
.delete((req, res, next) => {
      res.end('Deleting dish: ' + req.params.dishId);
});*/

module.exports = dishRouter;