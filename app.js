var dotenv = require('dotenv');
dotenv.config();
var seq = require('./sequelize');
var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var cors = require('cors'); // Obrigatorio para ligar ao React
var path = require('path');

// Importa apenas as rotas reais do teu projeto
var userRouter = require('./routes/users');       
var tweetRouter = require('./routes/tweets');     
var commentRouter = require('./routes/comments'); 
var followRouter = require('./routes/follows');   
var likeRouter = require('./routes/likes');       

var app = express();

var FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors( {origin : FRONTEND_URL, credentials: true } )); // Permite que o React fale com o Node.js
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Torna a pasta 'public' acessível para servir arquivos estáticos (ex:imagens)
app.use(express.static(path.join(__dirname, 'public')));


// Rotas oficiais da tua API
app.use('/user', userRouter);       
app.use('/tweets', tweetRouter);     
app.use('/comments', commentRouter); 
app.use('/follows', followRouter);   
app.use('/likes', likeRouter);       

// Captura qualquer rota que nao exista e cria um erro 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Tratamento de erros - Devolve sempre JSON para o React ler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    erro: err.message
  });
});

module.exports = app;
