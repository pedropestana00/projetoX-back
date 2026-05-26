const sequelize = require('../sequelize');
const Seguidores = sequelize.Seguidores;

module.exports = {
    // Seguir ou parar de seguir um utilizador
    toggleFollow: async (req, res) => {
        try {
            const seguidorId = req.userLoggedIn.id_utilizador; // ID de quem está logado
            const seguidoId = parseInt(req.params.userId); // ID do perfil alvo

            // Impede que o utilizador siga a si próprio
            if (seguidorId === seguidoId) {
                return res.status(400).json({ erro: "Não se pode seguir a si próprio." });
            }

            // Verifica se a relação já existe na base de dados
            const relacaoExistente = await Seguidores.findOne({
                where: { id_seguidor: seguidorId, id_seguido: seguidoId }
            });

            if (relacaoExistente) {
                // Se o registo existe, significa que já o seguia -> Faz UNFOLLOW (Delete)
                await relacaoExistente.destroy();
                return res.json({ status: "unfollow", mensagem: "Deixou de seguir o utilizador." });
            } else {
                // Se não existe, cria a relação -> Faz FOLLOW (Insert)
                await Seguidores.create({ id_seguidor: seguidorId, id_seguido: seguidoId });
                return res.json({ status: "follow", mensagem: "Começou a seguir o utilizador." });
            }
        } catch (error) {
            res.status(500).json({ erro: "Erro ao processar a operação." });
        }
    }
};
