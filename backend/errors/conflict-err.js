const { CONFLICT } = require('../utils/status-codes');

// 409: o e-mail do cadastro já existe
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = CONFLICT;
  }
}

module.exports = ConflictError;
