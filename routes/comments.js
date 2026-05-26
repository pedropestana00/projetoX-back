const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verificarToken } = require('../middleware/auth');

// POST /comments/tweets/:tweetId -> Comentar num tweet específico
router.post('/tweets/:tweetId', verificarToken, commentController.createComment);

// GET /comments/tweets/:tweetId -> Ver comentários de um tweet específico
router.get('/tweets/:tweetId', verificarToken, commentController.getTweetComments);

// PUT /comments/:id -> Editar um comentário específico (Dono ou Admin)
router.put('/:id', verificarToken, commentController.updateComment);

// DELETE /comments/:id -> Eliminar um comentário específico (Dono ou Admin)
router.delete('/:id', verificarToken, commentController.deleteComment);

module.exports = router;
