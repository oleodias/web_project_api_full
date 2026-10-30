const { isCelebrateError } = require('celebrate');
const {
  BAD_REQUEST,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} = require('../utils/status-codes');

// O tratador de erros central: TODO erro da API passa por aqui e sai no
// mesmo formato, { message }. O Express o reconhece pelos QUATRO
// parâmetros; o next fica na assinatura mesmo sem uso (a regra
// no-unused-vars do .eslintrc ignora o nome "next").
//
// Por que não usamos o errors() do celebrate: ele responde no formato dele
// ({ statusCode, error, message, validation }), e o checklist pede que a
// resposta de erro tenha só o campo message. Tratando o erro do celebrate
// aqui, ele também passa pelo errorLogger e pelo formato único.
module.exports = (err, req, res, next) => {
  // Erros nossos (pasta errors/): já trazem o status
  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  // celebrate: o corpo, a URL ou os parâmetros não seguem o esquema.
  // details é um Map por segmento (body, params...): a mensagem diz quais
  // campos falharam.
  if (isCelebrateError(err)) {
    const fields = [...err.details.values()]
      .flatMap((joiError) => joiError.details.map((detail) => detail.path.join('.')));
    return res.status(BAD_REQUEST).send({ message: `Dados inválidos: ${fields.join(', ')}` });
  }

  // CastError: um id malformado que passou pela validação.
  if (err.name === 'CastError') {
    return res.status(BAD_REQUEST).send({ message: 'ID inválido' });
  }

  // ValidationError: dados que não passam no esquema do Mongoose.
  if (err.name === 'ValidationError') {
    return res.status(BAD_REQUEST).send({ message: 'Dados inválidos' });
  }

  // 11000: o índice unique do e-mail recusou um cadastro repetido.
  if (err.code === 11000) {
    return res.status(CONFLICT).send({ message: 'Este e-mail já está cadastrado' });
  }

  // Erros do próprio Express com status 400: JSON malformado no corpo,
  // endereço malformado (/users/%E0).
  if (err.status === BAD_REQUEST) {
    return res.status(BAD_REQUEST).send({ message: 'Requisição inválida' });
  }

  // Qualquer outra coisa: 500, sem expor os detalhes do erro.
  return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ocorreu um erro no servidor' });
};
