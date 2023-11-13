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



const app = express();

app.use(cors()) 

app.use(express.json()); 

app.use(limiter);

app.use(mongo_sanitize());

app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

//                                                              ----------LES ROUTES---------


app.use('/api/sauces', sauceRoutes); 
app.use('/api/auth', userRoutes);
app.use(`/images`, express.static(path.join(__dirname, 'images')));

module.exports = app;