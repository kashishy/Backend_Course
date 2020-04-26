//Mongoose is used to define schema in the mongodb
//As mongodb and node mongo driver does not define a particular structure for the document
//Mongoose is used to restrict the document structure for a collection
//from mongoose we can use all the drivers of mongo driver
//mongoose has its own built in fucntion to interact with mongo database
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: String,
        required: true
    }
}, {
    //timestamp has two fields. Created and updated both in ISO format
    timestamps: true
});


const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    //Dish schema contains schema of comments, here array of comments schema type
    //this sub document inside a document
    comments: [commentSchema]
},{
    timestamps: true
});

//to make use of schema we to create a model of this schema
//contains name of the schema and schema definition
//mongo gives pural name to the model name, like here dish, it will create a dishes collection
//mongoose has built in fucntion to create pural of english words
var Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;