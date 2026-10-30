const winston = require('winston');
const expressWinston = require('express-winston');

// Cada requisição vira uma linha JSON em request.log; cada erro, em
// error.log. O corpo da requisição não entra no log por padrão (ele traria
// a senha do cadastro e do login). Os .log estão no .gitignore.
const requestLogger = expressWinston.logger({
  transports: [new winston.transports.File({ filename: 'request.log' })],
  format: winston.format.json(),
});

const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.File({ filename: 'error.log' })],
  format: winston.format.json(),
});

module.exports = { requestLogger, errorLogger };
