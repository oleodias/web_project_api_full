import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Header from './Header/Header.jsx';
import Main from './Main/Main.jsx';
import Footer from './Footer/Footer.jsx';
import Register from './Register/Register.jsx';
import Login from './Login/Login.jsx';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute.jsx';
import InfoTooltip from './InfoTooltip/InfoTooltip.jsx';
import api from '../utils/api.js';
import * as auth from '../utils/auth.js';
import * as tokenStorage from '../utils/token.js';
import CurrentUserContext from '../contexts/CurrentUserContext.js';

function App() {
  // O tipo inicial é o mesmo dos dados que vão chegar: um objeto para o
  // usuário, um array para os cartões, null para "nenhum pop-up aberto".
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [popup, setPopup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Autenticação. token é o JWT do usuário: começa com o que estiver salvo
  // no localStorage (ou null). É ele que dispara o carregamento dos dados.
  // email é o do usuário logado, para o cabeçalho.
  const [token, setToken] = useState(() => tokenStorage.getToken());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  // Começa true quando há um token salvo: até o servidor responder se ele
  // vale, as rotas não são desenhadas. Sem isso, quem já entrou passaria por
  // /signin por um instante a cada recarga.
  const [isCheckingToken, setIsCheckingToken] = useState(() => Boolean(token));
  // O aviso do cadastro e do login: null (fechado) ou { isSuccess }.
  const [tooltip, setTooltip] = useState(null);

  const navigate = useNavigate();

  // Sempre que o token muda (na montagem, com o token salvo, ou depois do
  // login): entrega o token à Api e pede o perfil ao /users/me. Esse pedido
  // também CONFERE o token: se ele venceu ou é inválido, o servidor
  // responde 401, e o token é apagado. Só depois, os cartões.
  //
  // Na API própria, o /users/me devolve o usuário completo (com o e-mail):
  // uma solicitação serve para conferir o token, preencher o cabeçalho e o
  // perfil. No projeto anterior eram duas APIs, e por isso duas solicitações.
  useEffect(() => {
    if (!token) {
      return;
    }

    api.setToken(token);
    api
      .getUserInfo()
      .then((userData) => {
        setCurrentUser(userData);
        setEmail(userData.email);
        setIsLoggedIn(true);
        return api.getInitialCards();
      })
      .then((cardsData) => setCards(cardsData))
      .catch((error) => {
        tokenStorage.removeToken();
        setToken(null);
        console.error(error);
      })
      .finally(() => setIsCheckingToken(false));
  }, [token]);

  function handleRegister({ email: newEmail, password }) {
    auth
      .register(newEmail, password)
      .then(() => setTooltip({ isSuccess: true }))
      .catch((error) => {
        console.error(error);
        setTooltip({ isSuccess: false });
      });
  }

  function handleLogin({ email: loginEmail, password }) {
    auth
      .authorize(loginEmail, password)
      .then((data) => {
        // O JWT chega no login: vai para o localStorage (para a próxima
        // visita) e para o estado (que dispara o useEffect acima). Até o
        // /users/me responder, as rotas ficam escondidas; quando ele
        // responde, isLoggedIn já é true e a página principal aparece.
        tokenStorage.setToken(data.token);
        setIsCheckingToken(true);
        setToken(data.token);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
        setTooltip({ isSuccess: false });
      });
  }

  function handleSignOut() {
    tokenStorage.removeToken();
    setToken(null);
    api.setToken(null);
    setIsLoggedIn(false);
    setEmail('');
    setCurrentUser({});
    setCards([]);
    navigate('/signin', { replace: true });
  }

  // Depois de um cadastro bem-sucedido, fechar o aviso leva ao login.
  function handleCloseTooltip() {
    if (tooltip?.isSuccess) {
      navigate('/signin');
    }
    setTooltip(null);
  }

  // selectedPopup, e não popup: o mesmo nome esconderia o estado acima.
  function handleOpenPopup(selectedPopup) {
    setPopup(selectedPopup);
  }

  function handleClosePopup() {
    setPopup(null);
  }

  function handleCardLike(card, isLiked) {
    // isLiked é o estado atual (o Card calcula a partir de card.likes); a API
    // devolve o cartão atualizado, que entra no lugar do antigo. map cria um
    // array novo: nada é mutado.
    api
      .changeLikeStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((currentCard) =>
            currentCard._id === card._id ? newCard : currentCard,
          ),
        );
      })
      .catch((error) => console.error(error));
  }

  function handleCardDelete(card) {
    setIsLoading(true);
    api
      .deleteCard(card._id)
      .then(() => {
        // currentCard, e não card: o mesmo nome esconderia o cartão excluído,
        // e a comparação daria sempre false (a lista inteira sumiria).
        setCards((state) =>
          state.filter((currentCard) => currentCard._id !== card._id),
        );
        handleClosePopup();
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }

  function handleUpdateUser(data) {
    setIsLoading(true);
    api
      .setUserInfo(data)
      .then((newData) => {
        setCurrentUser(newData);
        handleClosePopup();
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }

  function handleUpdateAvatar(data) {
    setIsLoading(true);
    api
      .setUserAvatar(data)
      .then((newData) => {
        setCurrentUser(newData);
        handleClosePopup();
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }

  function handleAddPlaceSubmit(data) {
    setIsLoading(true);
    api
      .addCard(data)
      .then((newCard) => {
        // O cartão novo entra no início, como no projeto anterior. A forma de
        // função usa a lista mais recente, mesmo que ela tenha mudado
        // enquanto a solicitação estava a caminho.
        setCards((state) => [newCard, ...state]);
        handleClosePopup();
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, handleUpdateUser, handleUpdateAvatar, isLoading }}
    >
      <div className='page__content'>
        <Header
          email={email}
          isLoggedIn={isLoggedIn}
          onSignOut={handleSignOut}
        />
        {!isCheckingToken && (
          <Routes>
            <Route
              path='/'
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Main
                    cards={cards}
                    popup={popup}
                    onOpenPopup={handleOpenPopup}
                    onClosePopup={handleClosePopup}
                    onCardLike={handleCardLike}
                    onCardDelete={handleCardDelete}
                    onAddPlaceSubmit={handleAddPlaceSubmit}
                  />
                  <Footer />
                </ProtectedRoute>
              }
            />
            {/* /signup e /signin ficam fora do ProtectedRoute; quem já entrou
                é mandado para a página principal. */}
            <Route
              path='/signup'
              element={
                isLoggedIn ? (
                  <Navigate to='/' replace />
                ) : (
                  <Register onRegister={handleRegister} />
                )
              }
            />
            <Route
              path='/signin'
              element={
                isLoggedIn ? (
                  <Navigate to='/' replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path='*'
              element={<Navigate to={isLoggedIn ? '/' : '/signin'} replace />}
            />
          </Routes>
        )}
        {tooltip && (
          <InfoTooltip
            isSuccess={tooltip.isSuccess}
            onClose={handleCloseTooltip}
          />
        )}
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
