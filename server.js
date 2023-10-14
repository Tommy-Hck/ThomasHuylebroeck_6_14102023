//importer le package http de node
const http = require ('http');
//appeler notre appli pour importer app
const app = require ('./app');
//créer un serveur. Arguments = fonction qui sera appelé à chaque requête du serveur.
// const server = http.createServer((req, res) =>{ //automatiquement 2 arguments: requête (req) et reponse (res)
    // res.end('voilà la réponse du premier serveur'); //méthode end de l'objet réponse pour envoyer une réponse
// });

const normalizePort = val => {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val;
    }
    if (port >= 0) {
      return port;
    }
    return false;
  };
  const port = normalizePort(process.env.PORT || '3000'); //la fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne 
  app.set('port', port);
  
  const errorHandler = error => {   //la fonction errorHandler  recherche les différentes erreurs et les gère de manière appropriée. Elle est ensuite enregistrée dans le serveur
    if (error.syscall !== 'listen') {
      throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges.');
        process.exit(1);
        //break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use.');
        process.exit(1);
        //break;
      default:
        throw error;
    }
  };

  const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port); //un écouteur d'évènements est également enregistré, consignant le port ou le canal nommé sur lequel le serveur s'exécute dans la console.

//dire à l'app express sur quel port elle va tourner
// app.set('port', process.env.PORT || 3000);
// const server = http.createServer(app);

//le serveur doit maintenant écouter/attendre les requêtes envoyées
// server.listen(process.env.PORT || 3000); // par défaut port 3000
//serveur.listen (process.env.PORT || 5000) Si l'environnement sur lequel fonctionne le serveur nous envoie un port à utiliser autre que 3000

