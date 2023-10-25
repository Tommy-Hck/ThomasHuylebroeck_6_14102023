const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router(); //permet de créer des routeurs séparés pour chaque route principale de l'application. Oenregistre ensuite les routes individuelles.
const multer = require ('../middleware/multer-config');

//importer mon schema
const sauceCtrl = require('../controllers/sauce'); //sauceCtrl = le fichier sauce présent dans le dossier controllers

//gestion des routes
router.get('/', auth, sauceCtrl.getAllSauces); //appeler l'authentification en PREMIER sinon ne fonctionne pas
router.post('/', auth, multer, sauceCtrl.createSauce); //(req, res, next) =>{               //Ici on utilise la méthode post et on va chercher le middleware createSauce de la page sauce du dos controller
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);

module.exports = router;