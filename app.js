require('dotenv').config()
const mongoose = require('mongoose');
const express = require ('express');
const cors = require('cors');
const path = require ('path');
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const mongo_sanitize = require('express-mongo-sanitize');
const logger = require('./conf/winston_conf');
//importer le router
const sauceRoutes = require('./routes/sauce'); //déco
const userRoutes = require('./routes/user');


mongoose.connect('mongodb+srv://Sirius:RZDqtOVgH9ptgx5b@cluster0.cnlgijl.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(() => console.log('Connexion à MongoDB échouée'));



//créer une application express
const app = express();



app.use(express.json()); //Express prend toutes les requêtes qui ont comme Content-Type  application/json  et met à disposition leur  body  directement sur l'objet req

app.use((req, res, next) => {  //Le CORS définit comment les serveurs et les navigateurs interagissent, en spécifiant quelles ressources peuvent être demandées de manière légitime.
    res.setHeader('Access-Control-Allow-Origin', '*'); //accéder à notre API depuis n'importe quelle origine donc tout le monde ( '*' )
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); //'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
    next();
  });


//                                                              ----------LES ROUTES---------

//déco
app.use('/api/sauces', sauceRoutes); // ici, on importe sauceRoutes pour récup les routes app.get etc. du fichier sauce pour éviter de surcharger app.js. C'est module.exports = router qui permet de l'envoyer
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
//exporter l'application pour y accéder depuis les autres fichiers du projet
module.exports = app;