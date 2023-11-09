const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const jwt = require ('jsonwebtoken');
const User = require('../models/User');
const email_valid = require('email-validator');
const pw_valid = require('password-validator');

var schema = new pw_valid();

// sécurité : règle d'acceptation du mot de passe d'inscription
schema
    .is().min(3)
    .is().max(20)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd', 'Password123']); 
    // les mots de passe trop évidents.

exports.signup = (req, res, next) => {
    if (email_valid.validate(req.body.email) && schema.validate(req.body.password)) {
        const hashedmail = cryptoJS.HmacSHA256(req.body.email, process.env.EMAIL_TOKEN).toString();
        bcrypt.hash(req.body.password, Number(process.env.HASH_SALT))
            .then(hash => {
                const user = new User({
                    email: hashedmail,
                    password: hash
                });

            user.save()
.then(() => {
    console.log("Utilisateur enregistré avec succès.");
    res.status(201).json({ message: 'Utilisateur créé' });
})
.catch(error => {
    console.error("Erreur lors de l'enregistrement de l'utilisateur:", error); 
    res.status(400).json({ error });
});
})
.catch(error => {
console.error("Erreur lors du hachage du mot de passe:", error); 
res.status(500).json({ error });
});
            
    }
    else {

        res.status(500).json({ message: 'Mauvais identifiant/mot de passe' });
        
    }
}


exports.login = (req, res, next) => {

    const hashedmail = cryptoJS.HmacSHA256(req.body.email, process.env.EMAIL_TOKEN).toString();
    User.findOne({ email: hashedmail })
    .then (user => {
        if (user === null){
            res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'});
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid =>{
                if (!valid) {
                    res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'})
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id},
                            process.env.TOKEN_SIGN_KEY, 
                            {expiresIn: process.env.TOKEN_EXPIRE_IN }
                        )
                    });
                }
            })
            .catch(error =>{
                res.status(500).json({ error });
            });
        }
    })
    .catch(error => {
        res.status(500).json({error});
    })
};