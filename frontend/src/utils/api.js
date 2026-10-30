// Toda a comunicação com o servidor: a classe Api do projeto anterior. Ela só
// faz as solicitações e devolve as promessas; o que fazer com os dados é
// decidido no App.
class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
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
    return fetch(`${this._baseUrl}/cards/`, {
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
    return fetch(`${this._baseUrl}/cards/`, {
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
  // ATUAL do cartão: se já está curtido, a ação é descurtir.
  changeLikeStatus(cardId, isLiked) {
    return fetch(`${this._baseUrl}/cards/${cardId}/likes`, {
      method: isLiked ? 'DELETE' : 'PUT',
      headers: this._headers,
    }).then(this._checkResponse);
  }
}

// Exporta a instância pronta, e não a classe: todo o app usa o mesmo objeto,
// já configurado com o endereço e o token.
// O token vem do arquivo .env (fora do Git): a Vite expõe ao código só as
// variáveis que começam com VITE_, em import.meta.env.
const api = new Api({
  baseUrl: 'https://around-api.pt-br.tripleten-services.com/v1',
  headers: {
    authorization: import.meta.env.VITE_API_TOKEN,
    'Content-Type': 'application/json',
  },
});

export default api;
