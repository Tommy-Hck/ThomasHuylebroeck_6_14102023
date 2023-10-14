const jwt = require('jsonwebtoken');

//on vérifie que le token renvoyé par le user correspond au token envoyé par le serveur et le transmettre aux autres middlewares ou gestionnaire de route
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
    } catch(error){
        res.status(401).json({ error });
    }
};