const { FORBIDDEN } = require('../utils/status-codes');

// 403: sabemos quem é, mas ele não tem o direito (excluir o cartão de outra pessoa)
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = FORBIDDEN;
  }
}

module.exports = ForbiddenError;
