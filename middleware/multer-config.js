const multer = require ('multer');
const fs = require('fs')

const dir = `./${process.env.UPLOAD_DIRECTORY_NAME}`;

//crée le dossier de reception des images s'il n'existe pas
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({  
    //créer const storage à passer à multer comme configuration qui contient la logique nécessaire pour indiquer à multer où enregistrer les fichiers entrants
    destination: (req, file, callback) => {  
        //la fonction destination indique à multer d'enregistrer les fichiers dans le dossier images
        // callback(null, 'images')
        callback(null, process.env.UPLOAD_DIRECTORY_NAME);
    },
    filename: (req, file, callback) => { 
    //                                      données du cours
        //fonction filename indique à multer d'utiliser le nom d'origine, de remplacer les espaces par des '_' et ajouter un timestamp Date.now() comme nom de fichier. 
        //Utilise ensuite la const dictionnaire de type MIME pour résoudre l'extension de fichier appropriée.
        // const name = file.originalname.split(' ').join('_');
        // const extension = MIME_TYPES[file.mimetype];
        // callback(null, name + Date.now() + '.' + extension);

    //                                       données optimisées pour Piiquante
        const fieldNameWithoutExtension = file.originalname.slice(0, file.originalname.lastIndexOf('.'));
        const extension = MIME_TYPES[file.mimetype];
        
        callback(null, `${fieldNameWithoutExtension}-${Date.now()}.${extension}`);
    }
});

module.exports = multer({ storage }).single('image');
//Nous exportons ensuite l'élément multer entièrement configuré, lui passons notre constante storage et lui indiquons que nous gérerons uniquement les téléchargements de fichiers image.