const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const { JWT_SECRET } = require('../utils/config');

// Os controladores não montam respostas de erro: passam o erro com next(),
// e o tratador central (middlewares/error-handler.js) escolhe o status.

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

// GET /users/me — o _id vem do token (req.user, preenchido pelo middleware
// auth), nunca da URL nem do corpo.
module.exports.getCurrentUser = (req, res, next) => {
  findUserOrFail(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  // O celebrate já conferiu o corpo antes de chegar aqui (routes/validation).
  const {
    name, about, avatar, email, password,
  } = req.body;

  // Guardamos o HASH, nunca a senha. O 10 é o custo: 2^10 rodadas. O salt
  // é gerado pelo bcrypt e fica dentro do próprio hash.
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    // O select: false do esquema vale para buscas, não para o create: o
    // documento devolvido aqui AINDA tem o hash. Por isso a resposta lista
    // os campos um a um, sem o password.
    .then((user) => res.status(201).send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch(next); // e-mail repetido → erro 11000 → 409 no tratador central
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      // Só o _id no payload: é o que o middleware auth precisa, e o payload
      // pode ser lido por qualquer um (é assinado, não criptografado).
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next); // UnauthorizedError (401) vindo do findUserByCredentials
};

// new: true devolve o documento JÁ atualizado (o padrão é o antigo);
// runValidators: true aplica as regras do esquema também no update.
const updateOptions = { new: true, runValidators: true };

// Editar SÓ o próprio perfil: o _id vem de req.user, então não há como
// apontar para o perfil de outra pessoa.
module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, updateOptions)
    .orFail(() => new NotFoundError('Usuário não encontrado'))
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, updateOptions)
    .orFail(() => new NotFoundError('Usuário não encontrado'))
    .then((user) => res.send(user))
    .catch(next);
};
