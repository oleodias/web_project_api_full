import { BASE_URL } from './constants.js';

// Toda a comunicação com o servidor: a classe Api do projeto anterior. Ela só
// faz as solicitações e devolve as promessas; o que fazer com os dados é
// decidido no App.
class Api {
  constructor({ baseUrl }) {
    this._baseUrl = baseUrl;
    this._token = null;
  }

  // O token não é mais fixo (como o do curso nos projetos anteriores): é o
  // JWT do usuário que entrou. O App o entrega aqui sempre que ele muda.
  setToken(token) {
    this._token = token;
  }

  // Um getter, e não um objeto montado no construtor: assim cada solicitação
  // leva o token ATUAL.
  get _headers() {
    return {
      authorization: `Bearer ${this._token}`,
      'Content-Type': 'application/json',
    };
  }

  // O fetch só rejeita quando a rede falha; um 404 ou um 500 chegam no then()
  // com res.ok === false. Esta verificação transforma o status de erro numa
  // rejeição, que vai parar no catch() de quem chamou.
  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error: ${res.status}`);
  }

  getUserInfo() {
    return fetch(`${this._baseUrl}/users/me`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, {
      headers: this._headers,
    }).then(this._checkResponse);
  }

  setUserInfo({ name, about }) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify({ name, about }),
    }).then(this._checkResponse);
  }

  setUserAvatar({ avatar }) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify({ avatar }),
    }).then(this._checkResponse);
  }

  addCard({ name, link }) {
    return fetch(`${this._baseUrl}/cards`, {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({ name, link }),
    }).then(this._checkResponse);
  }

  deleteCard(cardId) {
    return fetch(`${this._baseUrl}/cards/${cardId}`, {
      method: 'DELETE',
      headers: this._headers,
    }).then(this._checkResponse);
  }

  // Mesma URL para curtir e descurtir; muda só o método. isLiked é o estado
  // ATUAL do cartão (calculado no Card): se já está curtido, a ação é descurtir.
  changeLikeStatus(cardId, isLiked) {
    return fetch(`${this._baseUrl}/cards/${cardId}/likes`, {
      method: isLiked ? 'DELETE' : 'PUT',
      headers: this._headers,
    }).then(this._checkResponse);
  }
}

// Exporta a instância pronta, e não a classe: todo o app usa o mesmo objeto.
const api = new Api({ baseUrl: BASE_URL });

export default api;
