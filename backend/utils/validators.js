// URL do avatar e das imagens dos cartões:
// - começa com http:// ou https://
// - www. é opcional
// - depois, letras, números e os caracteres ._~:/?%#[]@!$&'()*+,;=-
// - pode terminar com #
const URL_REGEX = /^https?:\/\/(www\.)?[a-zA-Z0-9._~:/?%#[\]@!$&'()*+,;=-]+#?$/;

const isUrl = (value) => URL_REGEX.test(value);

module.exports = { URL_REGEX, isUrl };
