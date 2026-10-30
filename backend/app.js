const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NotFoundError,
} = require('./utils/errors');

const { PORT = 3000 } = process.env;
const app = express();

mongoose
  .connect('mongodb://localhost:27017/aroundb')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((error) => console.error('Não foi possível conectar ao MongoDB:', error.message));

app.use(express.json());

// Autorização TEMPORÁRIA (será trocada na próxima sprint): todas as
// requisições agem como o usuário de teste criado pelo Postman.
app.use((req, res, next) => {
  req.user = {
    _id: '5d8b8592978f8bd833ca8133', // _id do usuário de teste
  };

  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Nenhuma rota atendeu: vira um NotFoundError e segue para o tratador.
app.use((req, res, next) => {
  next(new NotFoundError('A solicitação não foi encontrada'));
});

// Tratador de erros central: o Express o reconhece pelos QUATRO parâmetros,
// por isso o next fica na assinatura mesmo sem uso. Cada if termina com
// return, e o 500 fecha o bloco para qualquer erro inesperado.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  // CastError: um id malformado (/users/abc).
  if (err.name === 'CastError') {
    return res.status(BAD_REQUEST).send({ message: 'ID inválido' });
  }

  // ValidationError: dados que não passam no esquema (nome curto, link
  // inválido, campo obrigatório faltando).
  if (err.name === 'ValidationError') {
    return res.status(BAD_REQUEST).send({ message: 'Dados inválidos' });
  }

  // Erros do próprio Express com status 400: JSON malformado no corpo,
  // endereço malformado (/users/%E0).
  if (err.status === BAD_REQUEST) {
    return res.status(BAD_REQUEST).send({ message: 'Requisição inválida' });
  }

  return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ocorreu um erro no servidor' });
});

// No Express 5, se a porta já estiver ocupada, o erro chega como argumento
// deste callback. Sem o if, a mensagem de "listening" apareceria mesmo com o
// servidor fora do ar.
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`App listening at port ${PORT}`);
});
