// A chave que assina e confere os JWTs. Em produção vem do .env do servidor
// (NODE_ENV=production e JWT_SECRET=<64 caracteres hexadecimais>); fora dele,
// uma chave fixa de desenvolvimento, para o projeto rodar sem o .env.
//
// O login (jwt.sign) e o middleware auth (jwt.verify) importam DAQUI: se
// cada um escolhesse a chave por conta própria, uma diferença entre os dois
// faria todo token ser recusado com 401.
//
// Por que comparar com 'production', e não com 'development': o Node não
// define NODE_ENV sozinho (sem o .env, ele é undefined). Qualquer valor que
// não seja 'production' cai na chave de desenvolvimento.
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = {
  JWT_SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
};
