const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken } = require('../middleware/auth'); // Importa o teu middleware de autenticação

// --- ROTAS PÚBLICAS (AUTENTICAÇÃO) ---

// POST /user/register
router.post('/register', userController.register);

// POST /user/login
router.post('/login', userController.login);


// --- ROTAS PROTEGIDAS DO BACKOFFICE (REQUEREM TOKEN DE ADMIN) ---

// GET /user - Listar todos os utilizadores no painel
router.get('/', verificarToken, userController.getAllUsers);

// PUT /user/:id - Editar username ou email de uma conta
router.put('/:id', verificarToken, userController.updateUser);

// DELETE /user/:id - Excluir permanentemente uma conta
router.delete('/:id', verificarToken, userController.deleteUser);

module.exports = router;
