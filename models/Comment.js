module.exports = (sequelize, type) => {

    return sequelize.define('comentario', {
        id_comentario: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_tweet: {
            type: type.INTEGER,
            allowNull: false,
            references: {
                model: 'tweet', 
                key: 'id_tweet'
            },
            onDelete: 'CASCADE' 
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
        data_comentario: {
            type: type.DATE,
            allowNull: false,
            defaultValue: type.NOW
        }
    },{
        tableName: 'comentario',
        timestamps: false 
    });

}