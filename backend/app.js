// Lê o .env (só existe no servidor) para dentro de process.env. Precisa vir
// antes de qualquer require que use process.env, como o utils/config.js.
// quiet: a partir da versão 17, o dotenv imprime uma linha a cada config().
require('dotenv').config({ quiet: true });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { validateSignup, validateSignin } = require('./middlewares/validation');
const NotFoundError = require('./errors/not-found-err');

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/aroundb' } = process.env;
const app = express();

mongoose
  .connect(MONGO_URL)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((error) => console.error('Não foi possível conectar ao MongoDB:', error.message));

// CORS antes de tudo: o navegador manda um OPTIONS (preflight) antes de
// toda requisição com JSON ou com Authorization, e o cors() responde a ele.
// O enunciado também sugere app.options('*', cors()), mas no Express 5 o
// '*' sozinho derruba o servidor ("Missing parameter name"), e o
// app.use(cors()) já atende o OPTIONS de todas as rotas.
app.use(cors());
app.use(express.json());

// 1) o logger de requisições vem antes de todas as rotas
app.use(requestLogger);

// Teste de queda para a revisão: o erro é lançado dentro do setTimeout, fora
// do Express, e derruba o processo. O PM2 tem que subi-lo de novo.
// REMOVER DEPOIS DA REVISÃO.
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('O servidor travará agora');
  }, 0);
});

// 2) rotas públicas
app.post('/signin', validateSignin, login);
app.post('/signup', validateSignup, createUser);

// 3) daqui para baixo, só com um JWT válido
app.use(auth);

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Nenhuma rota atendeu: vira um NotFoundError e segue para o tratador.
app.use((req, res, next) => {
  next(new NotFoundError('A solicitação não foi encontrada'));
});

// 4) o logger de erros vem depois das rotas e antes do tratador
app.use(errorLogger);

// 5) o tratador central responde a todos os erros
app.use(errorHandler);

// No Express 5, se a porta já estiver ocupada, o erro chega como argumento
// deste callback. Sem o if, a mensagem de "listening" apareceria mesmo com o
// servidor fora do ar.
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`App listening at port ${PORT}`);
});
