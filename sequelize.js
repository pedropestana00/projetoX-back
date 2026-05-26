// Implement all the models and business logic using sequelize

const Sequelize = require('sequelize');
const UtilizadoresModel = require('./models/User');
const TweetsModel = require('./models/Tweet');
const ComentariosModel = require('./models/Comment');
const SeguidoresModel = require('./models/Follow');
const LikesModel = require('./models/Like');
const dotenv = require('dotenv');
dotenv.config();


// Criação da ligação à BD
const sequelize = new Sequelize(process.env.DB_NAME, 
    process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: 'mysql',
    dialectOptions: {
        ssl: {require: true, rejectUnauthorized: false}
    },
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,  
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const Utilizadores = UtilizadoresModel(sequelize, Sequelize);
const Tweets = TweetsModel(sequelize, Sequelize);
const Comentarios = ComentariosModel(sequelize, Sequelize);
const Seguidores = SeguidoresModel(sequelize, Sequelize);
const Likes = LikesModel(sequelize, Sequelize);

//Tweets <-> Utilizadores (1:N)
Tweets.belongsTo(Utilizadores, { foreignKey: 'id_utilizador', as: 'utilizador' });
Utilizadores.hasMany(Tweets, { foreignKey: 'id_utilizador', as: 'tweet' });

//Comentarios <-> Tweets e Utilizadores (1:N)
Comentarios.belongsTo(Tweets, { foreignKey: 'id_tweet', as: 'tweet' });
Tweets.hasMany(Comentarios, { foreignKey: 'id_tweet', as: 'comentario' });

Comentarios.belongsTo(Utilizadores, { foreignKey: 'id_utilizador', as: 'utilizador' });
Utilizadores.hasMany(Comentarios, { foreignKey: 'id_utilizador', as: 'comentario' });

//Likes (N:M entre Utilizadores e Tweets)
Likes.belongsTo(Utilizadores, { foreignKey: 'id_utilizador', as: 'utilizador' });
Utilizadores.hasMany(Likes, { foreignKey: 'id_utilizador', as: 'gosto' });

Likes.belongsTo(Tweets, { foreignKey: 'id_tweet', as: 'tweet' });
Tweets.hasMany(Likes, { foreignKey: 'id_tweet', as: 'gosto' });

//Seguidores (Auto-relacionamento N:M de Utilizadores para Utilizadores)
Seguidores.belongsTo(Utilizadores, { foreignKey: 'id_seguidor', as: 'seguidor' });
Utilizadores.hasMany(Seguidores, { foreignKey: 'id_seguido', as: 'seguido' });

Seguidores.belongsTo(Utilizadores, { foreignKey: 'id_seguido', as: 'seguido' });
Utilizadores.hasMany(Seguidores, { foreignKey: 'id_seguidor', as: 'seguidor' });


// Autenticação à BD
sequelize.authenticate()
    .then(() => {
        console.log("Connection has been established");
    })
    .catch(err => {
        console.error("Unable to connect", err);
    });

sequelize.sync({ force: false })
    .then(() => {
        console.log("Tables Created!");
    });


module.exports = {
    sequelize, Utilizadores, Tweets, Comentarios, Seguidores, Likes
}
