const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { verificarToken } = require('../middleware/auth');

// POST /likes/tweets/:tweetId -> Dar / Tirar Like
router.post('/tweets/:tweetId', verificarToken, likeController.toggleLike);

module.exports = router;
