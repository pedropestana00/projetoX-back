const sequelize = require('../sequelize');
const Sequelize = require('sequelize');
const { Utilizadores, Tweets, Comentarios } = require('../sequelize');

module.exports = {
    // Cria um novo comentário num tweet
    createComment: async (req, res) => {
        try {
            const { tweetId } = req.params;
            const { texto } = req.body;

            if (!texto) {
                return res.status(400).json({ erro: "O texto do comentário é obrigatório." });
            }

            if (texto.length > 280) {
                return res.status(400).json({ erro: "O comentário não pode exceder 280 caracteres." });
            }

            const comentario = await Comentarios.create({
                id_tweet: parseInt(tweetId),
                id_utilizador: req.userLoggedIn.id_utilizador,
                texto
            });

            res.status(201).json(comentario);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao criar o comentário." });
        }
    },

    // Lista todos os comentários de um tweet específico
    getTweetComments: async (req, res) => {
        try {
            const { tweetId } = req.params;

            const comentarios = await Comentarios.findAll({
                where: { id_tweet: tweetId },
                include: [
                    { 
                        model: Utilizadores, 
                        as: 'utilizador', 
                        attributes: ['id_utilizador', 'username']
                    }
                ],
                order: [['data_comentario', 'DESC']]
            });

            res.json(comentarios);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao carregar os comentários." });
        }
    },

    // Edita um comentário existente (Dono do comentário OU Admin)
    updateComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { texto } = req.body;

            const comentario = await Comentarios.findByPk(id);
            if (!comentario) {
                return res.status(404).json({ erro: "Comentário não encontrado." });
            }

            // Validação de Permissão: Se NÃO for o dono E NÃO for administrador, bloqueia
            if (comentario.id_utilizador !== req.userLoggedIn.id_utilizador && req.userLoggedIn.is_admin !== true) {
                return res.status(403).json({ erro: "Não tem permissões para editar este comentário." });
            }

            if (!texto) {
                return res.status(400).json({ erro: "O texto do comentário não pode ficar vazio." });
            }

            if (texto.length > 280) {
                return res.status(400).json({ erro: "O comentário não pode exceder 280 caracteres." });
            }

            // Atualiza o texto do comentário na base de dados
            await comentario.update({ texto });
            res.json({ mensagem: "Comentário atualizado com sucesso.", comentario });
        } catch (error) {
            res.status(500).json({ erro: "Erro ao atualizar o comentário." });
        }
    },

    // Elimina um comentário (Dono do comentário, dono do tweet original OU admin)
    deleteComment: async (req, res) => {
        try {
            const { id } = req.params;
            const utilizadorLogadoId = req.userLoggedIn.id_utilizador;

            // Procura o comentário e inclui o modelo do Tweet associado (ajusta o modelo/as conforme o teu projeto)
            const comentario = await Comentarios.findByPk(id, {
                include: [{ 
                    model: Tweets, 
                    as: 'tweet', // Certifica-te de que este alias condiz com a tua associação BelongsTo
                    attributes: ['id_utilizador'] // Só precisamos do ID do autor do tweet
                }]
            });

            if (!comentario) {
                return res.status(404).json({ erro: "Comentário não encontrado." });
            }

            // --- VALIDAÇÃO DE PERMISSÕES ---
            const eDonoDoComentario = comentario.id_utilizador === utilizadorLogadoId;
            const eDonoDoTweetOriginal = comentario.tweet?.id_utilizador === utilizadorLogadoId;
            const eAdmin = req.userLoggedIn.is_admin === true || req.userLoggedIn.admin === true;

            // Se NÃO cumprir nenhuma das três condições, bloqueia o acesso
            if (!eDonoDoComentario && !eDonoDoTweetOriginal && !eAdmin) {
                return res.status(403).json({ erro: "Não tem permissões para eliminar este comentário." });
            }

            await comentario.destroy();
            return res.json({ mensagem: "Comentário eliminado com sucesso." });
        } catch (error) {
            console.error("Erro no deleteComment:", error); // Adicionado para debug no terminal
            return res.status(500).json({ erro: "Erro ao eliminar o comentário." });
        }
    }

};
