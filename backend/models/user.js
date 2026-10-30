const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { isUrl } = require('../utils/validators');
const UnauthorizedError = require('../errors/unauthorized-err');

const userSchema = new mongoose.Schema({
  // name, about e avatar ficaram opcionais: o cadastro só pede e-mail e
  // senha. Sem valor no corpo, o Mongoose grava o default.
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Jacques Cousteau',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Explorer',
  },
  avatar: {
    type: String,
    default: 'https://practicum-content.s3.us-west-1.amazonaws.com/resources/moved_avatar_1604080799.jpg',
    validate: {
      validator: isUrl,
      message: 'O avatar precisa ser um link válido',
    },
  },
  email: {
    type: String,
    required: true,
    // unique NÃO é um validador: é um índice no banco. O e-mail repetido não
    // é barrado pelo Mongoose, e sim pelo MongoDB, com o erro de código 11000
    // (o tratador central o transforma em 409).
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'O e-mail precisa ser válido',
    },
  },
  password: {
    type: String,
    required: true,
    // select: false — as buscas não trazem o hash. Só o login pede, com
    // .select('+password'). Atenção: isso vale para BUSCAS; o documento
    // devolvido pelo create() ainda tem o hash (ver createUser).
    select: false,
  },
});

// Método estático: chamado no modelo, User.findUserByCredentials(...).
// function, e não arrow function, porque o this precisa ser o modelo User.
// A mesma mensagem para "e-mail não existe" e "senha errada": quem tenta
// adivinhar não descobre quais e-mails estão cadastrados.
userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('E-mail ou senha incorretos'));
      }

      // then ANINHADO: aqui dentro o `user` ainda existe para ser devolvido
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new UnauthorizedError('E-mail ou senha incorretos'));
        }
        return user;
      });
    });
};

// 'user' no singular: o Mongoose cria a coleção "users".
module.exports = mongoose.model('user', userSchema);
