const multer = require ('multer');
const fs = require('fs')

const dir = './images';

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
    destination: (req, file, callback) => { 
        callback(null, 'images');
    },
    filename: (req, file, callback) => { 
        // const fieldNameWithoutExtension = file.originalname.slice(0, file.originalname.lastIndexOf('.'));
        // const extension = MIME_TYPES[file.mimetype];
        // callback(null, `${fieldNameWithoutExtension}-${Date.now()}.${extension}`);
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');
