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
import { getToken, removeToken, setToken } from '../utils/token.js';
import CurrentUserContext from '../contexts/CurrentUserContext.js';

function App() {
  // O tipo inicial é o mesmo dos dados que vão chegar: um objeto para o
  // usuário, um array para os cartões, null para "nenhum pop-up aberto".
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [popup, setPopup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Autenticação. email é o do usuário logado, para o cabeçalho.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  // Começa true quando há um token salvo: até o servidor responder se ele
  // vale, as rotas não são desenhadas. Sem isso, quem já entrou passaria por
  // /signin por um instante a cada recarga.
  const [isCheckingToken, setIsCheckingToken] = useState(() =>
    Boolean(getToken()),
  );
  // O aviso do cadastro e do login: null (fechado) ou { isSuccess }.
  const [tooltip, setTooltip] = useState(null);

  const navigate = useNavigate();

  // Na montagem: se há um token salvo, pergunta ao servidor se ele vale e
  // pega o e-mail. Token vencido ou inválido é apagado.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    auth
      .getUserData(token)
      .then(({ data }) => {
        setEmail(data.email);
        setIsLoggedIn(true);
      })
      .catch((error) => {
        removeToken();
        console.error(error);
      })
      .finally(() => setIsCheckingToken(false));
  }, []);

  // Perfil e cartões: uma solicitação de cada quando o usuário entra (na
  // montagem, se o token salvo vale; ou logo depois do login).
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    api
      .getUserInfo()
      .then((userData) => setCurrentUser(userData))
      .catch((error) => console.error(error));

    api
      .getInitialCards()
      .then((cardsData) => setCards(cardsData))
      .catch((error) => console.error(error));
  }, [isLoggedIn]);

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
      .then(({ token }) => {
        setToken(token); // o JWT é salvo no login, que é onde ele chega
        setEmail(loginEmail);
        setIsLoggedIn(true);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
        setTooltip({ isSuccess: false });
      });
  }

  function handleSignOut() {
    removeToken();
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

  function handleCardLike(card) {
    // card.isLiked é o estado atual; a API devolve o cartão atualizado, que
    // entra no lugar do antigo. map cria um array novo: nada é mutado.
    api
      .changeLikeStatus(card._id, card.isLiked)
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
