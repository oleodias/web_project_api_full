const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

const notFoundCard = () => new NotFoundError('Cartão não encontrado');

// Do mais novo para o mais antigo: o front põe o cartão recém-criado no
// início da lista, e assim a ordem continua a mesma depois de recarregar.
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .sort({ createdAt: -1 })
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  // owner vem do token (req.user), não do corpo
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send(card))
    .catch(next);
};

// Primeiro busca, depois confere o dono, só então apaga. Um
// findByIdAndDelete direto apagaria antes de saber de quem é o cartão.
module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(notFoundCard)
    .then((card) => {
      // owner é um ObjectId e req.user._id é uma string (veio do JSON do
      // token): === entre os dois daria sempre false. equals() compara o valor.
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Você não pode excluir o cartão de outra pessoa');
      }
      return card.deleteOne().then(() => res.send(card));
    })
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
