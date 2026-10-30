// Os códigos de status em constantes: o número solto no meio do código não
// diz o que significa, e um erro de digitação nele passaria despercebido.
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

// Erro de "não encontrado" com o status junto. É lançado pelo orFail() dos
// controladores e reconhecido pelo tratador central com instanceof.
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = NOT_FOUND;
  }
}

module.exports = {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  NotFoundError,
};
