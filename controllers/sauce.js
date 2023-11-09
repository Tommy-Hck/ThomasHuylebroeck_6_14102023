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
        // Ici, je vérifie si l'utilisateur qui veut modifier la sauce est bien celui qui l'a créée
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        if (req.file) {
          // Supprimer l'ancienne image si une nouvelle image est fournie
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            // Après avoir supprimé l'ancienne image, mettez à jour la sauce avec la nouvelle image
            SauceObj.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
              .catch(error => res.status(400).json({ error }));
          });
        } else {
          // Si aucune nouvelle image n'est fournie, mettez à jour la sauce sans supprimer l'ancienne image
          SauceObj.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
            .catch(error => res.status(400).json({ error }));
        }
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
            .then(() => { res.status(200).json({ message: 'Sauce supprimée' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  try {
    SauceObj.findOne({ _id: req.params.id }) //pour trouver un seul identifiant, un seul objet. Quand on clique sur un objet, on peut accéder à la page dédiée à cet objet. 
      .then(sauce => res.status(200).json(sauce))
  } catch (error) {
  }
};

exports.getAllSauces = (req, res, next) => { //intercepte uniquement les req get avec ce middleware
  try {
    SauceObj.find()  // renvoie un tableau contenant toutes les sauces dans notre base de données
      .then(sauces => res.status(200).json(sauces))
  } catch (error) { //promise
    console.error(error);
  }
};

//Implémenter like et dislike avec Winston

// exports.likeSauce = (req, res, next) => {
//   SauceObj.findOne({ _id: req.params.id }) //
//     .then(sauce => {
//       switch (req.body.like) {
//         case 0:  // utilisateur retire son j'aime ou j'aime pas
//           if (sauce.usersLiked.includes(req.body.userId)) {
//             SauceObj.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }, _id: req.params.id })
//               .then(() => res.status(201).json({ message: "J'aime" }))
//               .catch(error => {
//                 logger.error(`Removing like failed -  ${error}`);
//                 res.status(400).json({ error })
//               });
//           } else if (sauce.usersDisliked.includes(req.body.userId)) {
//             SauceObj.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }, _id: req.params.id })
//               .then(() => res.status(201).json({ message: "Je n'aime pas" }))
//               .catch(error => {
//                 logger.error(`Suppression du dislike échouée -  ${error}`);
//                 res.status(400).json({ error })
//               });
//           }
//           break;
//         case 1: // utilisateur aime la sauce
//           if (!sauce.usersLiked.includes(req.body.userId)) {
//             SauceObj.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id })
//               .then(() => res.status(201).json({ message: "J'aime" }))
//               .catch((error) => {
//                 logger.error(`Ajout du like échoué - ${error}`);
//                 res.status(400).json({ error });
//               });
//           }
//           break;

//         case -1: // utilisateur n'aime pas la sauce
//           if (!sauce.usersDisliked.includes(req.body.userId)) {
//             SauceObj.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id })
//               .then(() => res.status(201).json({ message: "Je n'aime pas" }))
//               .catch(error => {
//                 logger.error(`Ajout du dislike échoué - ${error}`);
//                 res.status(400).json({ error })
//               }
//               );
//           }
//           break;
//         default:
//           throw new Error('valeur erronée');
//       }
//     })
//     .catch(error => {
//       logger.error(`Impossible de récupérer la sauce (t'es dans la sauce) -  ${error}`);
//       res.status(400).json({ error })
//     });
// }

// Implémenter like/dislike sans Winston

exports.likeSauce = (req, res, next) => {
  SauceObj.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId === req.body.userId) {
        // L'utilisateur est le propriétaire de la sauce je le tacle.
        res.status(401).json({ message: "Vous ne pouvez pas liker ou disliker votre propre sauce." });
      } else {
        switch (req.body.like) {
          case 0:
            if (sauce.usersLiked.includes(req.body.userId)) {
              // Retirer le like
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Like retiré' }))
                .catch(error => res.status(400).json({ error }));
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
              // Retirer le dislike
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Dislike retiré' }))
                .catch(error => res.status(400).json({ error }));
            }
            break;
          case 1:
            if (!sauce.usersLiked.includes(req.body.userId)) {
              // Ajouter un like
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Liked' }))
                .catch(error => res.status(400).json({ error }));
            }
            break;
          case -1:
            if (!sauce.usersDisliked.includes(req.body.userId)) {
              // Ajouter un dislike
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Disliked' }))
                .catch(error => res.status(400).json({ error }));
            }
            break;
          default:
            res.status(400).json({ message: 'Mauvaise valeur' });
        }
      }
    })
    .catch(error => {
      res.status(400).json({ message: `Impossible de récupérer la sauce - ${error}` });
    });
}
