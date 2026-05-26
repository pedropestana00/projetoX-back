module.exports = (sequelize, type) => {

    return sequelize.define('gosto', {
        id_utilizador: {
            type: type.INTEGER,
            primaryKey: true, // Parte da chave primária composta
            allowNull: false,
            references: {
                model: 'utilizador',
                key: 'id_utilizador'
            },
            onDelete: 'CASCADE'
        },
        id_tweet: {
            type: type.INTEGER,
            primaryKey: true, // Parte da chave primária composta
            allowNull: false,
            references: {
                model: 'tweet',
                key: 'id_tweet'
            },
            onDelete: 'CASCADE'
        }
    },{
        tableName: 'gosto',
        timestamps: false 
    });

}
