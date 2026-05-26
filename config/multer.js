const multer = require('multer');
const path = require('path');

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define a pasta onde as imagens vão ficar guardadas
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Cria um nome único para o ficheiro para não haver sobreposições
        // Exemplo: 1716300000000-foto.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas são permitidas imagens!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limita o tamanho a 5MB
});

module.exports = upload;
