const sequelize = require('../sequelize');
const Likes = sequelize.Likes;

module.exports = {
    // Dar ou retirar like num tweet
    toggleLike: async (req, res) => {
        try {
            const utilizadorId = req.userLoggedIn.id_utilizador; // ID vindo do token
            const tweetId = req.params.tweetId; // ID do tweet alvo

            // Procura se este utilizador já deu like neste tweet específico
            const likeExistente = await Likes.findOne({
                where: { id_utilizador: utilizadorId, id_tweet: tweetId }
            });

            if (likeExistente) {
                // Se já tinha dado like, elimina o registo (Tira o Like)
                await likeExistente.destroy();
                return res.json({ status: "retirado", mensagem: "Like removido." });
            } else {
                // Se não tinha dado like, cria o registo (Dá o Like)
                await Likes.create({ id_utilizador: utilizadorId, id_tweet: tweetId });
                return res.json({ status: "adicionado", mensagem: "Like adicionado." });
            }
        } catch (error) {
            res.status(500).json({ erro: "Erro ao processar o like." });
        }
    }
};
