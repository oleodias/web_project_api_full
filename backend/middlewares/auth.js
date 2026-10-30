const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');
const { JWT_SECRET } = require('../utils/config');

// Confere o JWT de toda requisição às rotas protegidas. Token válido →
// req.user = payload ({ _id, iat, exp }) e a requisição segue; senão, 401.
//
// O return antes de cada next(erro) é obrigatório: sem ele, a função
// continuaria rodando depois de passar o erro adiante (o replace num
// cabeçalho undefined quebraria, ou o next() seria chamado duas vezes).
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Autorização necessária'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload; // fora do try: let tem escopo de bloco

  try {
    // Lança se a assinatura não bate (JsonWebTokenError) ou se o token
    // venceu (TokenExpiredError): os dois casos são 401.
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError('Autorização necessária'));
  }

  req.user = payload;
  return next();
};
