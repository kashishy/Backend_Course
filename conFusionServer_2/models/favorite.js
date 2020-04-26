const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    
    user:  {
        //it will have refrence to user document, and can be filled with details
        //when required by populating
        //here only id will be stored
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
    }]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;