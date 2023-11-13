const fs = require('fs');
require('dotenv').config();
const SauceObj = require('../models/Sauce');



exports.createSauce = (req, res, next) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id; 
    delete sauceObject._userId; 

    const sauce = new SauceObj({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
    });
    sauce.save() 
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
 
  SauceObj.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        if (req.file) {
          sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          }
          const filename = sauce.imageUrl.split('/images')[1];
          fs.unlink(`images/${filename}`, () => {
            SauceObj.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
              .catch(error => res.status(400).json({ error }));
          });
        } else {
          sauceObject = { ...req.body };
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


exports.deleteSauce = (req, res, next) => { 
  SauceObj.findOne({ _id: req.params.id })  
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {  
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        const filename = sauce.imageUrl.split('/images')[1]; 
        fs.unlink(`images/${filename}`, () => {  
          sauce.deleteOne({ _id: req.params.id })  
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
    SauceObj.findOne({ _id: req.params.id })  
      .then(sauce => res.status(200).json(sauce))
  } catch (error) {
  }
};

exports.getAllSauces = (req, res, next) => { 
  try {
    SauceObj.find()  
      .then(sauces => res.status(200).json(sauces))
  } catch (error) { 
    console.error(error);
  }
};

// Implémenter like/dislike sans Winston

exports.likeSauce = (req, res, next) => {
  SauceObj.findOne({ _id: req.params.id })
    .then(sauce => {
        switch (req.body.like) {
          case 0:
            if (sauce.usersLiked.includes(req.body.userId)) {
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Like retiré' }))
                .catch(error => res.status(400).json({ error }));
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Dislike retiré' }))
                .catch(error => res.status(400).json({ error }));
            }
            break;
          case 1:
            if (!sauce.usersLiked.includes(req.body.userId)) {
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Liked' }))
                .catch(error => res.status(400).json({ error }));
            }
            break;
          case -1:
            if (!sauce.usersDisliked.includes(req.body.userId)) {
              SauceObj.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id })
                .then(() => res.status(201).json({ message: 'Disliked' }))
                .catch(error => res.status(400).json({ error }));
            }
            break;
          default:
            res.status(400).json({ message: 'Mauvaise valeur' });
        }
    })
    .catch(error => {
      res.status(400).json({ message: `Impossible de récupérer la sauce - ${error}` });
    });
}
