//using mongoose to connect to mongo database
const mongoose = require('mongoose');

//importing schema from dishes file
const Dishes = require('./models/dishes');

//creating connection string
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {

    console.log('Connected correctly to server');

    //this method creates and save the dish  into database
    Dishes.create({
        name: 'UthappizzaAshish',
        description: 'test'
    })
    .then((dish) => {
        console.log(dish);

        //it takes dish id that need to be updated  and new updated value, new: true tells to return updated dish
        return Dishes.findByIdAndUpdate(dish._id, {
            $set: { description: 'Updated test'}
        },{ 
            new: true 
        }).exec();
    })
    .then((dish) => {
        console.log(dish);

        //pushing comment to dish
        dish.comments.push({
            rating: 5,
            comment: 'I\'m getting a sinking feeling!',
            author: 'Leonardo di Carpaccio'
        });

        //saving updated dish with comment
        return dish.save();
    })
    .then((dishe) => {
        console.log(dishe);

        return Dishes.remove({});
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch((err) => {
        console.log(err);
    });


    //creating new dish variable
    /*var newDish = Dishes({
        name: 'Uthappizza',
        description: 'test'
    });

    //saving created dish to database
    newDish.save()
        .then((dish) => {
            console.log(dish);

            //finding all({}) the dishes in the database
            return Dishes.find({});
        })
        .then((dishes) => {
            //printing find dishes
            console.log(dishes);

            //removing all the dishes from the database
            return Dishes.remove({});
        })
        .then(() => {
            //closing database collection
            return mongoose.connection.close();
        })
        .catch((err) => {
            //print if any error occured
            console.log(err);
        });*/

})
.catch((err) => console.log(err));