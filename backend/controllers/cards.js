const Card = require('../models/card');
const { NotFoundError } = require('../utils/errors');

const notFoundCard = () => new NotFoundError('Cartão não encontrado');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body || {};

  // owner vem do middleware temporário de autorização, não do corpo
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send(card))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndDelete(req.params.cardId)
    .orFail(notFoundCard)
    .then((card) => res.send(card))
    .catch(next);
};

// $addToSet só acrescenta o _id se ele ainda não estiver no array: o mesmo
// usuário não curte duas vezes. $pull tira o _id.
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(notFoundCard)
    .then((card) => res.send(card))
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(notFoundCard)
    .then((card) => res.send(card))
    .catch(next);
};
