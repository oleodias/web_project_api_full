import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../images/logo.svg';

export default function Header(props) {
  const { isLoggedIn, email, onSignOut } = props;
  const { pathname } = useLocation();

  // Menu do celular (até 544px): o e-mail e o "Sair" ficam escondidos atrás
  // do botão de três linhas e aparecem acima da faixa do logotipo.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleMenuClick() {
    setIsMenuOpen((state) => !state);
  }

  function handleSignOutClick() {
    setIsMenuOpen(false);
    onSignOut();
  }

  // Quem não entrou vê o link para a outra tela de acesso.
  const authLink =
    pathname === '/signup'
      ? { to: '/signin', text: 'Faça o login' }
      : { to: '/signup', text: 'Inscrever-se' };

  // O mesmo bloco de e-mail + "Sair" serve à faixa (computador) e ao menu
  // (celular); o CSS mostra um ou outro.
  const userInfo = (
    <>
      <p className='header__email'>{email}</p>
      <button
        className='header__link header__link_type_signout'
        type='button'
        onClick={handleSignOutClick}
      >
        Sair
      </button>
    </>
  );

  return (
    <header className='header page__section'>
      {isLoggedIn && isMenuOpen && (
        <div className='header__menu'>{userInfo}</div>
      )}
      <div className='header__bar'>
        <img
          alt='Logotipo Around The U.S.'
          className='logo header__logo'
          src={logo}
        />
        {isLoggedIn ? (
          <>
            <div className='header__user'>{userInfo}</div>
            <button
              aria-label={isMenuOpen ? 'Fechar o menu' : 'Abrir o menu'}
              className={`header__menu-button ${
                isMenuOpen ? 'header__menu-button_opened' : ''
              }`}
              type='button'
              onClick={handleMenuClick}
            />
          </>
        ) : (
          <Link className='header__link' to={authLink.to}>
            {authLink.text}
          </Link>
        )}
      </div>
    </header>
  );
}
