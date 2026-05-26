module.exports = (sequelize, type) => {

return sequelize.define('tweet', {
        id_tweet: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_utilizador: {
            type: type.INTEGER,
            allowNull: false,
            references: {
                model: 'utilizador', 
                key: 'id_utilizador' 
            },
            onDelete: 'CASCADE'
        },
        texto: {
            type: type.STRING(280),
            allowNull: false
        },
        imagem: {
            type: type.STRING(255),
            allowNull: true
        },
        data_publicacao: {
            type: type.DATE,
            allowNull: false,
            defaultValue: type.NOW
        }
    },{
        tableName: 'tweet',
        timestamps: false // Mantido false devido ao uso exclusivo do 'criado_em'
    });

}
