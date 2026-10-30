const User = require('../models/user');
const { NotFoundError } = require('../utils/errors');

// Os controladores não montam respostas de erro: passam o erro com next(),
// e o tratador central do app.js escolhe o status pelo tipo (ERR-018 da
// revisão anterior: uma decisão, um lugar).

const findUserOrFail = (userId) => User.findById(userId).orFail(
  () => new NotFoundError('Usuário não encontrado'),
);

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  findUserOrFail(req.params.userId)
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  // Só os três campos do esquema: qualquer outro campo do corpo é ignorado.
  // No Express 5, uma requisição sem corpo JSON deixa req.body undefined; o
  // "|| {}" faz os campos chegarem vazios ao Mongoose, que responde com
  // ValidationError (400) em vez de um TypeError (500).
  const { name, about, avatar } = req.body || {};

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch(next);
};

// new: true devolve o documento JÁ atualizado (o padrão é o antigo);
// runValidators: true aplica as regras do esquema também no update (o padrão
// é não aplicar).
const updateOptions = { new: true, runValidators: true };

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body || {};

  User.findByIdAndUpdate(req.user._id, { name, about }, updateOptions)
    .orFail(() => new NotFoundError('Usuário não encontrado'))
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body || {};

  User.findByIdAndUpdate(req.user._id, { avatar }, updateOptions)
    .orFail(() => new NotFoundError('Usuário não encontrado'))
    .then((user) => res.send(user))
    .catch(next);
};
