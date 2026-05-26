const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const { verificarToken } = require('../middleware/auth');
const upload = require('../config/multer');

// GET /tweets/global -> Feed completo (Página Explorar)
router.get('/global', verificarToken, tweetController.getGlobalFeed);

// GET /tweets/seguindo -> Feed de quem sigo (Página Principal)
router.get('/seguindo', verificarToken, tweetController.getFeed);

// POST /tweets -> Criar um tweet
router.post('/', verificarToken, upload.single('imagem'), tweetController.createTweet);

// PUT /tweets/:id -> Editar um tweet (Dono ou Admin)
router.put('/:id', verificarToken, tweetController.updateTweet);

// DELETE /tweets/:id -> Eliminar um tweet (Dono ou Admin)
router.delete('/:id', verificarToken, tweetController.deleteTweet);

module.exports = router;
