const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router(); //permet de créer des routeurs séparés pour chaque route principale de l'application. Oenregistre ensuite les routes individuelles.
const multer = require ('../middleware/multer-config');

//importer mon schema
const stuffCtrl = require('../controllers/stuff'); //stuffCtrl = le fichier stuff présent dans le dossier controllers

//gestion des routes
router.get('/', auth, stuffCtrl.getAllThings); //appeler l'authentification en PREMIER sinon ne fonctionne pas
router.post('/', auth, multer, stuffCtrl.createThing); //(req, res, next) =>{               //Ici on utilise la méthode post et on va chercher le middleware createThing de la page stuff du dos controller
router.put('/:id', auth, stuffCtrl.modifyThing);
router.get('/:id', auth, stuffCtrl.getOneThing);
router.get('/', auth, stuffCtrl.getAllThings);
router.delete('/:id', auth, stuffCtrl.deleteThing);

module.exports = router;