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
        // OWASP / RGPD : hashage de l'adresse mail
        const hashedmail = cryptoJS.HmacSHA256(req.body.email, process.env.EMAIL_TOKEN).toString();
        console.log(hashedmail);
        console.log(req.body.email);
        bcrypt.hash(req.body.password, Number(process.env.HASH_SALT))
            .then(hash => {
                const user = new User({
                    email: hashedmail,
                    password: hash
                });
            //     user.save()
            //         .then(() => res.status(201).json({ message: 'Utilisateur crée' }))
            //         .catch(error => res.status(400).json({ error }));
            // })
            // .catch(error => {
            //     console.log(error);
            //     res.status(500).json({ error });
            //     });
            user.save()
.then(() => {
    console.log("Utilisateur enregistré avec succès.");
    res.status(201).json({ message: 'Utilisateur créé' });
})
.catch(error => {
    console.error("Erreur lors de l'enregistrement de l'utilisateur:", error); // Ajoutez un log pour les erreurs d'enregistrement
    res.status(400).json({ error });
});
})
.catch(error => {
console.error("Erreur lors du hachage du mot de passe:", error); // Ajoutez un log pour les erreurs de hachage
res.status(500).json({ error });
});
            
    }
    else {

        res.status(500).json({ message: 'Mauvais identifiant/mot de passe' });
        
    }
}
//     bcrypt.hash(req.body.password, 10) //hacher le pwd, req.body.pwd pour récup le pwd du user et le salt: 10 tours de l'algo pour sécure le pwd. Plus c'est bien mais prend plus de temps
//         .then(hash => {
//             console.log("Mot de passe haché avec succès.");
//             const user = new User({
//                 email: req.body.email, //mail du corps de la requête
//                 password: hash
//             });

// };


exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})  //req.body.something = valeur donnée par le client
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
                            process.env.TOKEN_SIGN_KEY, //Nous utilisons une chaîne secrète de développement temporaire pour crypter notre token 
                            //(à remplacer par une chaîne aléatoire beaucoup plus longue pour la production). Puisque cette chaîne sert de clé pour le chiffrement et le déchiffrement du token, elle doit être difficile à deviner, sinon n’importe qui pourrait générer un token en se faisant passer pour notre serveur.
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