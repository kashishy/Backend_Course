const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//mongoose currency module is for type currency data
require('mongoose-currency').loadType(mongoose);

//defining currency type to be used in schema
const Currency = mongoose.Types.Currency;


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
        //it will have refrence to user document, and can be filled with details
        //when required by populating
        //here only id will be stored
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
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
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency, //currency type used
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
},{
    timestamps: true
});

var Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;