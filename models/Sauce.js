const mongoose = require ('mongoose');

// GESTION DES ERREURS MONGO, traduction en messages plus causants (optionnel)
//A plugin to transform mongodb like errors (E.G. "11000 - duplicate key") into Mongoose ValidationError instances
const mongodbErrorHandler =require('mongoose-mongodb-errors')

const sauceSchema = mongoose.Schema({
    userId: { type: String, minLength: 5, maxLength: 25 },
    name: { type: String, required: true, minLength: 3, maxLength: 25 },
    manufacturer: { type: String, required: true, minLength: 3, maxLength: 15 },
    description: { type: String, required: true, minLength: 3, maxLength: 120 },
    mainPepper: { type: String, required: true, minLength: 3, maxLength: 20 },
    imageUrl: { type: String, required: true, minLength: 5 },
    heat: { type: Number, required: true, min: 1, max: 10 },
    likes: { type: Number, required: true, default: 0, min: 0 },
    dislikes: { type: Number, required: true, default: 0, min: 0 },
    usersLiked: {  type: [String] },
    usersDisliked: { type: [String]},
});

sauceSchema.plugin(mongodbErrorHandler);
module.exports = mongoose.model('Sauce', sauceSchema);