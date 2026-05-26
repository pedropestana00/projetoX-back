const jwt = require('jsonwebtoken');
const sequelize = require('../sequelize');
const { Utilizadores } = require('../sequelize');

module.exports = {
    // Registo de utilizador
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            
            if (!username || !email || !password) {
                return res.status(400).json({ erro: "Campos obrigatórios em falta." });
            }

            const novoUtilizador = await Utilizadores.create({
                username,
                email,
                password: password 
            });

            // CORREÇÃO: Alterado de .id para .id_utilizador para condizer com o teu MySQL
            return res.status(201).json({ 
                mensagem: "Utilizador registado com sucesso.", 
                id: novoUtilizador.id_utilizador 
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ erro: "Username ou Email já estão em uso." });
            }
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    },

    // Login de utilizador
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ erro: "Campos obrigatórios em falta." });
            }

            const user = await Utilizadores.findOne({ where: { username } });
            if (!user) {
                return res.status(401).json({ erro: "Credenciais incorretas." });
            }

            if (password !== user.password) {
                return res.status(401).json({ erro: "Credenciais incorretas." });
            }

            const token = jwt.sign(
                { id: user.id_utilizador, admin: user.is_admin  }, 
                process.env.JWT_SECRET, 
                { expiresIn: '2h' }
            );

            return res.json({ token, user: { id: user.id_utilizador, username: user.username, admin: user.is_admin } });
        } catch (error) {
            return res.status(500).json({ erro: "Erro interno no servidor." });
        }
    },

    // --- MÉTODOS ADICIONAIS ADICIONADOS PARA O BACKOFFICE ---

    // 1. Listar todos os utilizadores (Visualizar)
    getAllUsers: async (req, res) => {
        try {
            // Apenas administradores podem pedir a lista completa de utilizadores
            if (!req.userLoggedIn || req.userLoggedIn.is_admin !== true) {
                return res.status(403).json({ erro: "Acesso negado. Apenas administradores." });
            }

            const lista = await Utilizadores.findAll({
                attributes: ['id_utilizador', 'username', 'email', 'is_admin'] // Oculta a password por segurança
            });

            return res.json(lista);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao listar utilizadores." });
        }
    },

    // 2. Atualizar dados de um utilizador (Editar)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params; // Recebe o id_utilizador vindo da rota
            const { username, email } = req.body;

            if (!req.userLoggedIn || req.userLoggedIn.is_admin !== true) {
                return res.status(403).json({ erro: "Acesso negado. Apenas administradores." });
            }

            const user = await Utilizadores.findByPk(id);
            if (!user) {
                return res.status(404).json({ erro: "Utilizador não encontrado." });
            }

            // Impede a alteração da conta master do admin principal para proteção do sistema
            if (user.username === 'admin') {
                return res.status(400).json({ erro: "Não é permitido alterar o utilizador administrador do sistema." });
            }

            await user.update({ username, email });
            return res.json({ mensagem: "Utilizador atualizado com sucesso.", user });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ erro: "Username ou Email já estão em uso." });
            }
            return res.status(500).json({ erro: "Erro ao atualizar utilizador." });
        }
    },

    // 3. Excluir uma conta (Eliminar)
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            if (!req.userLoggedIn || req.userLoggedIn.is_admin !== true) {
                return res.status(403).json({ erro: "Acesso negado. Apenas administradores." });
            }

            const user = await Utilizadores.findByPk(id);
            if (!user) {
                return res.status(404).json({ erro: "Utilizador não encontrado." });
            }

            // Proteção extra contra auto-eliminação
            if (user.username === 'admin') {
                return res.status(400).json({ erro: "Não pode eliminar a conta root de administração." });
            }

            // O comando destroy executa o CASCADE configurado no MySQL, eliminando tweets automaticamente
            await user.destroy();
            return res.json({ mensagem: "Utilizador eliminado com sucesso." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao eliminar utilizador." });
        }
    }
};

