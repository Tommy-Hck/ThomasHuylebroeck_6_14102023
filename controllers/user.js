const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const email_valid = require('email-validator');
const pw_valid = require('password-validator');

const userModel = require('../models/User');

var schema = new pw_valid();

// sécurité : règle d'acceptation du mot de passe d'inscription
schema
    .is().min(3) //minimum 3 caractères
    .is().max(20) //maximum 20
    .has().uppercase() //doit contenir -
    .has().lowercase() //doit contenir _
    .has().digits(2) //doit contenir deux chiffres
    .has().not().spaces() //ne doit pas contenir d'espaces
    .is().not().oneOf(['Passw0rd', 'Password123']); 
    // et toute une liste potentielle de mots de passe trop faciles qu'on pourrait mettre dans une table ou dans un json

exports.signUp = (req, res, next) => {
    if (email_valid.validate(req.body.email) && schema.validate(req.body.password)) {
        // OWASP / RGPD : hashage de l'adresse mail
        const hashedmail = cryptoJS.HmacSHA256(req.body.email, process.env.EMAIL_TOKEN).toString();
        bcrypt.hash(req.body.password, Number(process.env.HASH_SALT))
            .then(hash => {
                const user = new userModel({
                    email: hashedmail,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Created user' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    }
}

exports.logIn = (req, res, next) => {
    // conséquence de hashage de l'adresse mail pour s'identifier
    const hashedmail = cryptoJS.HmacSHA256(req.body.email, process.env.EMAIL_TOKEN).toString();
    userModel.findOne({ email: hashedmail })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Bad login/password' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Bad login/password' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SIGN_KEY,
                            { expiresIn: process.env.TOKEN_EXPIRE_IN }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};