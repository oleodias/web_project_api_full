const { NOT_FOUND } = require('../utils/status-codes');

// 404: o usuário, o cartão ou o endereço não existem
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = NOT_FOUND;
  }
}

module.exports = NotFoundError;
