import { useContext } from 'react';
import Card from './components/Card/Card.jsx';
import Popup from './components/Popup/Popup.jsx';
import NewCard from './components/Popup/components/NewCard/NewCard.jsx';
import EditProfile from './components/Popup/components/EditProfile/EditProfile.jsx';
import EditAvatar from './components/Popup/components/EditAvatar/EditAvatar.jsx';
import ImagePopup from './components/Popup/components/ImagePopup/ImagePopup.jsx';
import RemoveCard from './components/Popup/components/RemoveCard/RemoveCard.jsx';
import CurrentUserContext from '../../contexts/CurrentUserContext.js';

export default function Main(props) {
  const {
    cards,
    popup,
    onOpenPopup,
    onClosePopup,
    onCardLike,
    onCardDelete,
    onAddPlaceSubmit,
  } = props;
  const { currentUser } = useContext(CurrentUserContext);

  // Cada pop-up é um objeto { title, children }: o título e o conteúdo que o
  // <Popup> vai mostrar. O estado de qual está aberto fica no App.
  const newCardPopup = {
    title: 'Novo local',
    children: <NewCard onAddPlaceSubmit={onAddPlaceSubmit} />,
  };
  const editProfilePopup = {
    title: 'Editar perfil',
    children: <EditProfile />,
  };
  const editAvatarPopup = {
    title: 'Alterar a foto do perfil',
    children: <EditAvatar />,
  };

  // O pop-up da imagem não tem título, e o type 'image' dá ao <Popup> o
  // modificador de imagem.
  function handleCardClick(card) {
    onOpenPopup({ type: 'image', children: <ImagePopup card={card} /> });
  }

  // A lixeira não exclui direto: abre o "Tem certeza?", e só o envio desse
  // formulário chama o onCardDelete do App.
  function handleCardDeleteRequest(card) {
    onOpenPopup({
      title: 'Tem certeza?',
      children: <RemoveCard card={card} onCardDelete={onCardDelete} />,
    });
  }

  return (
    <main className='content'>
      <section className='profile page__section'>
        <button
          aria-label='Alterar a foto do perfil'
          className='profile__avatar-button'
          type='button'
          onClick={() => onOpenPopup(editAvatarPopup)}
        >
          <img
            alt='Foto de perfil'
            className='profile__image'
            src={currentUser.avatar}
          />
        </button>
        <div className='profile__info'>
          <h1 className='profile__title'>{currentUser.name}</h1>
          <button
            aria-label='Editar perfil'
            className='profile__edit-button'
            type='button'
            onClick={() => onOpenPopup(editProfilePopup)}
          />
          <p className='profile__description'>{currentUser.about}</p>
        </div>
        <button
          aria-label='Adicionar cartão'
          className='profile__add-button'
          type='button'
          onClick={() => onOpenPopup(newCardPopup)}
        />
      </section>

      <section className='cards page__section'>
        <ul className='cards__list'>
          {cards.map((card) => (
            <Card
              key={card._id}
              card={card}
              onCardClick={handleCardClick}
              onCardLike={onCardLike}
              onCardDelete={handleCardDeleteRequest}
            />
          ))}
        </ul>
      </section>

      {popup && (
        <Popup onClose={onClosePopup} title={popup.title} type={popup.type}>
          {popup.children}
        </Popup>
      )}
    </main>
  );
}
