// const Thing = require('../models/Thing');
// const fs = require('fs');

// exports.createThing = (req, res, next) =>{
//     const thingObject = JSON.parse(req.body.thing);
//     delete thingObject._id; //retire le champs id de la requête, sinon c'est mango qui va générer les id
//     delete thingObject._userId; //suppression du champ _userId envoyé par le client pour éviter 
//     const thing = new Thing({
//       ...thingObject,
//       userId: req.auth.userId,
//       imageUrl: `${req.protocol}://${req.get('host')}/images${req.file.filename}` //req.protocol et req.get('host'), connectés par '://' et suivis de req.file.filename, pour reconstruire l'URL complète du fichier enregistré.
//     });
//     thing.save() //pour enregistrer l'instance que je viens de créer puis retourne un promise
//       .then(() => {res.status(201).json({message: 'Objet enregistré'})})
//       .catch(error => {res.status(400).json( { error })})
//     };
    

//   exports.modifyThing = (req, res, next) =>{
//     Thing.updateOne({_id: req.params.id}, {...req.body, _id: req.params.id}) //A REVOIR AVEC STEPHANE 
//     .then(() => res.status(200).json({ message: 'objet modifié'}))
//     .catch(error => res.status(400).json({ error }));
//   };

//   exports.deleteThing = (req, res, next) => { //pour supprimer un objet
//     Thing.findOne({ _id: req.params.id })  //utiliser l'ID que nous recevons comme paramètre pour accéder au Thing correspondant dans la base de données.
//         .then(thing => {
//           if (thing.userId != req.auth.userId) {  //Nous vérifions si l’utilisateur qui a fait la requête de suppression est bien celui qui a créé le Thing.
//            res.status(401).json({ message: 'Non autorisé' });
//           } else {
//               const filename = thing.imageUrl.split('/images/')[1];  //Nous utilisons le fait de savoir que notre URL d'image contient un segment /images/ pour séparer le nom de fichier.
//               fs.unlink(`images/${filename}`, () => {  //Utiliser ensuite la fonction unlink du package fs pour supprimer ce fichier, en lui passant le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé.
//                 Thing.deleteOne({_id: req.params.id})  //Dans le callback, nous implémentons la logique d'origine en supprimant le Thing de la base de données.
//                   .then(() => { res.status(200).json({message: 'Objet supprimé'})})
//                   .catch(error => res.status(401).json({ error }));
//               });
//           }
//         })
//         .catch(error => {
//           res.status(500).json({ error });
//         });
//       };

// exports.getOneThing =(req, res, next) => { // le : dit a express que cette partie de la route est dynamique et donc j'y aurais accès dans l'objet req.params.id
//     //req.params.id
//     Thing.findOne({ _id: req.params.id }) //pour trouver un seul identifiant, un seul objet. Quand on clique sur un objet, on peut accéder à la page dédiée à cet objet. 
//         .then(thing => res.status(200).json(thing))
//         .catch(error => res.status(404).json({ error }));
// };

// exports.getAllThings =(req, res, next) => { //intercepte uniquement les req get avec ce middleware
//     Thing.find()  // renvoie un tableau contenant tous les Things dans notre base de données
//         .then(things => res.status(200).json(things)) //promise
//         .catch(error => res.status(400).json({ error }));
};