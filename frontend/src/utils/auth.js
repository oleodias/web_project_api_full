// Cadastro e login: o serviço de autenticação da TripleTen. Os cartões e o
// perfil continuam na API do Around (utils/api.js): este serviço só tem
// /signup, /signin e /users/me (conferido: /cards responde 404).
export const BASE_URL = 'https://se-register-api.en.tripleten-services.com/v1';

// Mesmo padrão da classe Api: o fetch só rejeita em falha de rede; um 400 ou
// 401 chega no then() com res.ok === false e vira uma rejeição aqui.
function checkResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
}

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

// Confere se o token ainda vale e devolve { data: { email, _id } }.
export function getUserData(token) {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then(checkResponse);
}
