const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
//for uploading files to server
const multer = require('multer');
//for handling cross origin resource sharing
const cors = require('./cors');

//configuring multer, deciding destination to store files
//here two things defined, destination and filenameto be stored on server database
const storage = multer.diskStorage({

    //it recieve req, file that processed by multer and callback function
    destination: (req, file, cb) => {
        //cb takes error and destination folder where file is stored
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        //cb takes error and filename that will be stored for current file in database
        cb(null, file.originalname)
    }
});

//this defines which type of files will be uploaded
//i.e. which type files will be accepted for storing
const imageFileFilter = (req, file, cb) => {

    //here /\ is for regular expression, in string search pattern 
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {

        //return error
        return cb(new Error('You can upload only image files!'), false);
    }

    //otherwise accept file
    cb(null, true);
};

//configuring multer, it contain two parameters
//1st is storage and 2nd is for filefilter
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })//for sending options to server before actual request
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
//configuring post for uploading file, apart form authentication parameters
//it takes multer object, which uses single function form for uploading single file
//single receives field name that contails file details in form, this function can handle errors if any occure
//in uploading file
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {

    //if reached here means successfully uploaded file in database
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    //file field also contains path data where file is stored
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;