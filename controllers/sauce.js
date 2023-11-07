const fs = require('fs');
require('dotenv').config();
const SauceObj = require('../models/Sauce');
exports.createSauce = (req, res, next) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id; //retire le champs id de la requête, sinon c'est mango qui va générer les id
    delete sauceObject._userId; //suppression du champ _userId envoyé par le client car on ne doit pas faire confiance. Il pourrait passer l'userId d'une autre personne.
   
    const sauce = new SauceObj({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //req.protocol et req.get('host'), connectés par '://' et suivis de req.file.filename, pour reconstruire l'URL complète du fichier enregistré.
    });
    sauce.save() //pour enregistrer l'instance que je viens de créer puis retourne un promise
      .then(() => { res.status(201).json({ message: 'Sauce enregistrée' }) })
      .catch(error => {
        res.status(400).json({ error })
      })
  } catch (error) {
    console.error(error);
  }
};

  exports.modifySauce = (req, res, next) => {
  let sauceObject = {};
  if (req.file) {
    sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
  } else {
    sauceObject = { ...req.body };
  }

   // Je récupère la sauce depuis la base de données
   SauceObj.findOne({ _id: req.params.id })
   .then(sauce => {
     if (sauce.userId !== req.auth.userId) {
       // Ici, je vérifie si l'utilisateur qui veut modifier la sauce est bien celui qui l'a crée
       res.status(401).json({ message: 'Non autorisé' });
     } else {
       // Si l'utilisateur est le bon, la sauce se met à jour
       SauceObj.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
         .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
         .catch(error => res.status(400).json({ error }));
     }
   })
   .catch(error => {
     res.status(500).json({ error });
   });
};

exports.deleteSauce = (req, res, next) => { //pour supprimer un objet
  SauceObj.findOne({ _id: req.params.id })  //utiliser l'ID que nous recevons comme paramètre pour accéder au sauce correspondant dans la base de données.
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {  //Nous vérifions si l’utilisateur qui a fait la requête de suppression est bien celui qui a créé le sauce.
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];  //Nous utilisons le fait de savoir que notre URL d'image contient un segment /images/ pour séparer le nom de fichier.
        fs.unlink(`images/${filename}`, () => {  //Utiliser ensuite la fonction unlink du package fs pour supprimer ce fichier, en lui passant le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé.
          sauce.deleteOne({ _id: req.params.id })  //Dans le callback, nous implémentons la logique d'origine en supprimant le sauce de la base de données.
            .then(() => { res.status(200).json({ message: 'Objet supprimé' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => { // le : dit a express que cette partie de la route est dynamique et donc j'y aurais accès dans l'objet req.params.id
  try {
    SauceObj.findOne({ _id: req.params.id }) //pour trouver un seul identifiant, un seul objet. Quand on clique sur un objet, on peut accéder à la page dédiée à cet objet. 
      .then(sauce => res.status(200).json(sauce))
  } catch (error) {
  }
};

exports.getAllSauces = (req, res, next) => { //intercepte uniquement les req get avec ce middleware
  try {
    SauceObj.find()  // renvoie un tableau contenant tous les sauces dans notre base de données
      .then(sauces => res.status(200).json(sauces))
  } catch (error) { //promise
    console.error(error);
  }
};