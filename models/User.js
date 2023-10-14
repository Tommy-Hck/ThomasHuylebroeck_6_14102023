const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //installer unique validator pour éviter les problèmes avec email unique: true

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true}, //unique: true empêche un utilisateur de créer plusieurs comptes avec la même adresse mail
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator); //appliquer le validateur au schema avant d'en faire un modèle

module.exports = mongoose.model('User', userSchema);