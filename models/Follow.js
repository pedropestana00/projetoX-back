module.exports = (sequelize, type) => {   

    return sequelize.define('seguidor', {
        id_seguidor: {
            type: type.INTEGER,
            primaryKey: true, // Define como parte da chave primária composta
            allowNull: false,
            references: {
                model: 'utilizador',
                key: 'id_utilizador'
            },
            onDelete: 'CASCADE'
        },
        id_seguido: {
            type: type.INTEGER,
            primaryKey: true, // Define como parte da chave primária composta
            allowNull: false,
            references: {
                model: 'utilizador',
                key: 'id_utilizador'
            },
            onDelete: 'CASCADE'
        }
    },{
        tableName: 'seguidor',
        timestamps: false,
        validate: {
            // Garante na aplicação que um utilizador não se segue a si próprio (CHECK CONSTRAINT)
            naoSeguirSiMesmo() {
                if (this.id_seguidor === this.id_seguido) {
                    throw new Error('Um utilizador não se pode seguir a si próprio.');
                }
            }
        }
    });
}

