import { BASE_URL } from './constants.js';

// Cadastro e login: as duas rotas públicas da API. Todo o resto (perfil e
// cartões) está em utils/api.js e exige o token.

// O fetch só rejeita quando a rede falha; um 400, 401 ou 409 chega no then()
// com res.ok === false e vira uma rejeição aqui.
function checkResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
}

// Resposta: o usuário criado (sem a senha)
export function register(email, password) {
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(checkResponse);
}

// Resposta: { token }
export function authorize(email, password) {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(checkResponse);
}
