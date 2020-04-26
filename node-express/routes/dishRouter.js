const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    //next define this is not the end, look for additional details that satisfy this end point
    //req and res paramteres of this will be passed to the following code that satisfy the required request
    next();
})
//req & res are modified one, that are modified in .all part
.get((req,res,next) => {
    res.end('Will send all the dishes to you!');
    //here we don't need next() as request will be completed here
})
.post((req, res, next) => {
    //body of the request msg is in req.body part
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
    //dishId information is in params of req parameter
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
});

module.exports = dishRouter;