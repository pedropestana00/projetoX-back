
const Sequelize = require('sequelize');
const { sequelize, Utilizadores, Tweets, Seguidores } = require('../sequelize');


module.exports = {
    // Cria um novo tweet (Máximo 280 caracteres)
    createTweet: async (req, res) => {
    try {
        const { texto } = req.body;
        
        if (!texto) return res.status(400).json({ erro: "O texto é obrigatório." });
        if (texto.length > 280) return res.status(400).json({ erro: "O limite é de 280 caracteres." });

        const imagem_twitter_clone = req.file ? `/uploads/${req.file.filename}` : null;
        
        // Mantido id_utilizador porque o teu middleware garante essa propriedade!
        const tweet = await Tweets.create({
            id_utilizador: req.userLoggedIn.id_utilizador,
            texto,
            imagem: imagem_twitter_clone
        });

        return res.status(201).json(tweet);
    } catch (error) {
        // MUITO IMPORTANTE: Imprime o erro completo no terminal do teu Node
        console.error("🚨 ERRO DETALHADO NO TERMINAL:", error);

        // Envia o erro real diretamente para o React conseguir ler no Alerta
        return res.status(500).json({ 
            erro: "Erro ao criar o tweet.", 
            mensagemOriginal: error.message,
            sqlError: error.parent?.sqlMessage || "Não é um erro do MySQL, é um erro de JavaScript ou Caminho!"
        });
    }
},


    // Procura e envia os tweets das pessoas que o utilizador segue + os seus próprios
    getFeed: async (req, res) => {
        try {
            // Safety check to make sure the user object exists
            if (!req.userLoggedIn || !req.userLoggedIn.id_utilizador) {
            return res.status(401).json({ error: 'Utilizador não autenticado.' });
            }

            const utilizadorId = req.userLoggedIn.id_utilizador; 

            // 1. Vai buscar os IDs de quem tu segues
            const quemEuSigo = await Seguidores.findAll({
                where: { id_seguidor: utilizadorId },
                attributes: ['id_seguido']
            });

            const listaIds = quemEuSigo.map(s => s.id_seguido);
            listaIds.push(utilizadorId); 

            // 2. Procura os tweets e adiciona a verificação de LIKE e FOLLOW na hora
            const feed = await Tweets.findAll({
                where: { id_utilizador: listaIds }, 
                attributes: {
                    include: [
                        // SE DESTE LIKE (1 ou 0)
                        [
                            Sequelize.literal(`EXISTS(
                                SELECT 1 FROM gosto 
                                WHERE gosto.id_tweet = tweet.id_tweet 
                                AND gosto.id_utilizador = ${utilizadorId}
                            )`),
                            'deiLike'
                        ],
                        // SE SEGUES O AUTOR DO TWEET (1 ou 0)
                        [
                            Sequelize.literal(`EXISTS(
                                SELECT 1 FROM seguidor 
                                WHERE seguidor.id_seguidor = ${utilizadorId} 
                                AND seguidor.id_seguido = tweet.id_utilizador
                            )`),
                            'seguindoAutor'
                        ]
                    ]
                },
                include: [{ model: Utilizadores, as: 'utilizador', attributes: ['id_utilizador', 'username'] }],
                order: [['data_publicacao', 'DESC']]
            });

            res.json(feed);
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Erro ao carregar o feed." });

        }
    },

    // Procura e envia todos os tweets (pagina explorar)
    getGlobalFeed: async (req, res) => {
        try {
            // 1. Safety check to make sure the user object exists
            if (!req.userLoggedIn || !req.userLoggedIn.id_utilizador) {
            return res.status(401).json({ error: 'Utilizador não autenticado.' });
            }

            const utilizadorId = req.userLoggedIn.id_utilizador; // O seu ID vindo do token

            // Procura TODOS os tweets da base de dados 
            const feedGlobal = await Tweets.findAll({
                attributes: {
                    include: [
                        // SE DESTE LIKE (1 ou 0)
                        [
                            Sequelize.literal(`EXISTS(
                                SELECT 1 FROM gosto 
                                WHERE gosto.id_tweet = tweet.id_tweet 
                                AND gosto.id_utilizador = ${utilizadorId}
                            )`),
                            'deiLike'
                        ],
                        // SE SEGUES O AUTOR DO TWEET (1 ou 0)
                        [
                            Sequelize.literal(`EXISTS(
                                SELECT 1 FROM seguidor 
                                WHERE seguidor.id_seguidor = ${utilizadorId} 
                                AND seguidor.id_seguido = tweet.id_utilizador
                            )`),
                            'seguindoAutor'
                        ]
                    ]
                },
                include: [{ model: Utilizadores, as: 'utilizador', attributes: ['id_utilizador', 'username'] }],
                order: [['data_publicacao', 'DESC']] // Mais recentes primeiro
            });

            res.json(feedGlobal);
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Erro ao carregar o feed completo." });
        }
    },


    // Edita um tweet (Permitido ao dono do tweet OU ao administrador)
    updateTweet: async (req, res) => {
        try {
            const { id } = req.params;
            const { texto, imagem } = req.body;

            const tweet = await Tweets.findByPk(id);
            if (!tweet) return res.status(404).json({ erro: "Tweet não encontrado." });

            // Validação de Permissão: Se NÃO for o dono E NÃO for administrador, bloqueia
            if (tweet.id_utilizador !== req.userLoggedIn.id_utilizador && req.userLoggedIn.is_admin !== true ) {
                return res.status(403).json({ erro: "Não tem permissões para editar este tweet." });
            }

            // Validação simples do tamanho do texto
            if (texto && texto.length > 280) {
                return res.status(400).json({ erro: "O limite é de 280 caracteres." });
            }

            // Criação dinâmica dos campos a atualizar (apenas o que for enviado no req.body)
            const updates = {};
            if (texto !== undefined) updates.texto = texto;
            if (imagem !== undefined) updates.imagem = imagem;

            await tweet.update(updates);
            res.json({ mensagem: "Tweet atualizado com sucesso.", tweet });
        } catch (error) {
            res.status(500).json({ erro: "Erro ao atualizar o tweet." });
        }
    },

    // Elimina um tweet (Apenas o dono ou um admin o pode fazer)
    deleteTweet: async (req, res) => {
        try {
            const { id } = req.params;
            const tweet = await Tweets.findByPk(id);

            if (!tweet) return res.status(404).json({ erro: "Tweet não encontrado." });

            // Validação simples: Se NÃO for o dono E NÃO for administrador, barra o acesso
            if (tweet.id_utilizador !== req.userLoggedIn.id_utilizador && req.userLoggedIn.is_admin !== true ) {
                return res.status(403).json({ erro: "Não tem permissões para eliminar este tweet." });
            }

            await tweet.destroy();
            res.json({ mensagem: "Tweet eliminado com sucesso." });
        } catch (error) {
            res.status(500).json({ erro: "Erro ao eliminar o tweet." });
        }
    }
};
