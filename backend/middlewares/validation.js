const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

// O celebrate confere a requisição ANTES do controlador: um corpo errado
// nem chega a gastar CPU com o hash da senha ou a ir ao banco. O Joi recusa
// campos que não estão listados no esquema.

// validator.isURL é mais rigoroso que o Joi.uri(). require_protocol: o
// esquema do Mongoose (utils/validators.js) exige http(s)://, e sem a opção
// o isURL aceitaria "exemplo.com" — o Joi deixaria passar e o banco
// recusaria depois. Assim as duas camadas concordam.
// 'string.uri' é o código de erro do validador de URL do próprio Joi.
const validateUrl = (value, helpers) => {
  if (validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) {
    return value;
  }
  return helpers.error('string.uri');
};

// ObjectId do MongoDB: 24 caracteres hexadecimais
const objectId = Joi.string().hex().length(24).required();

module.exports.validateSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    // opcionais: sem eles, valem os defaults do esquema
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(validateUrl),
  }),
});

module.exports.validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

module.exports.validateUserId = celebrate({
  params: Joi.object().keys({ userId: objectId }),
});

module.exports.validateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

module.exports.validateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validateUrl),
  }),
});

module.exports.validateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validateUrl),
  }),
});

module.exports.validateCardId = celebrate({
  params: Joi.object().keys({ cardId: objectId }),
});
