// importer express
const express = require('express');
//importer Mongoose
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const mongo_sanitize = require('express-mongo-sanitize');
require('dotenv').config();

//importer le router
const sauceRoutes = require('./routes/sauce'); //déco
const userRoutes = require('./routes/user');

// OWASP limiteur de tentatives requêtes pour éviter les brute force
// la configuration est paramétrée dans .env
const limiter = rateLimit({
  windowMs: Number(process.env.LIM_MINS) * 60 * 1000,
  max: Number(process.env.LIM_MAX),
  standardHeaders: true,
  legacyHeaders: false,
});

console.log(process.env.DB_LINK);
mongoose.connect(process.env.DB_LINK,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(() => console.log('Connexion à MongoDB échouée'));


//créer une application express
const app = express();

// app.use((req, res, next) => {  //Le CORS définit comment les serveurs et les navigateurs interagissent, en spécifiant quelles ressources peuvent être demandées de manière légitime.
//     res.setHeader('Access-Control-Allow-Origin', '*'); //accéder à notre API depuis n'importe quelle origine donc tout le monde ( '*' )
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); //'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
//     next();
//   });

app.use(cors()) // fait la même chose que ce que j'ai fait au dessus : authorise toutes les requêtes CORS (mieux en dev)

app.use(express.json()); //Express prend toutes les requêtes qui ont comme Content-Type  application/json  et met à disposition leur  body  directement sur l'objet req

app.use(limiter);

// OWASP : empecher l'injection de caractères tout pourris
app.use(mongo_sanitize());

// OWASP - protection des entêtes
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

//                                                              ----------LES ROUTES---------

//déco
app.use('/api/sauces', sauceRoutes); // ici, on importe sauceRoutes pour récup les routes app.get etc. du fichier sauce pour éviter de surcharger app.js. C'est module.exports = router qui permet de l'envoyer
app.use('/api/auth', userRoutes);
// app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(`/${process.env.FRONT_IMAGES_DIRECTORY}`, express.static(path.join(__dirname, process.env.UPLOAD_DIRECTORY_NAME )));


//exporter l'application pour y accéder depuis les autres fichiers du projet
module.exports = app;