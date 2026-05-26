const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { verificarToken } = require('../middleware/auth');

// POST /follows/utilizadores/:userId -> Seguir / Deixar de seguir
router.post('/utilizadores/:userId', verificarToken, followController.toggleFollow);

module.exports = router;
