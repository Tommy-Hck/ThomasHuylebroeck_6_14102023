# Instructions d'installation et de lancement du projet

## Packages : comment installer 
   - npm install


## Configuration
   - ### Env
      - Créer un fichier .env dans le répertoire principal
      - Y copier les données du fichier conf/.env-example
      - Modifier les valeurs si besoin selon les consignes ci-dessous.
      - Seul DB_LINK est à modifier obligatoirement, soit tout le lien, soit 'user' et 'password'
      - Ensuite vous pouvez modifier TOKEN_SIGN_KEY et EMAIL_TOKEN


## Lancement
   installer nodemon en global (npm install nodemon -g ou yarn add global nodemon)
   - npm server / nodemon server ou simplement nodemon ;

