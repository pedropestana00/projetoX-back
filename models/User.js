
module.exports = (sequelize, type) => {

     return sequelize.define('utilizador', {
        id_utilizador: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: type.STRING(50),
            allowNull: false,
            unique: true
        },
        email: {
            type: type.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: type.STRING(255),
            allowNull: false
        },
        is_admin: {
            type: type.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },{
        tableName: 'utilizador',
        timestamps: false // Definido como false porque não temos campos de data de criação ou atualização
    });

}

