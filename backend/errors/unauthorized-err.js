const { UNAUTHORIZED } = require('../utils/status-codes');

// 401: não sabemos quem é (sem token, token inválido, e-mail ou senha errados)
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = UNAUTHORIZED;
  }
}

module.exports = UnauthorizedError;
