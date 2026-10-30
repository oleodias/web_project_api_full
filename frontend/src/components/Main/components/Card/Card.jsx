import { useContext } from 'react';
import CurrentUserContext from '../../../../contexts/CurrentUserContext.js';

export default function Card(props) {
  const { card, onCardClick, onCardLike, onCardDelete } = props;
  const { name, link, isLiked, owner } = card;
  const { currentUser } = useContext(CurrentUserContext);

  // Só o dono do cartão vê a lixeira. owner é o _id de quem criou o cartão.
  const isOwn = owner === currentUser._id;

  // Verificar se o usuário atual "curtiu" o cartão
  const cardLikeButtonClassName = `card__like-button ${
    isLiked ? 'card__like-button_is-active' : ''
  }`;

  // O Card não decide nada: só avisa ao Main qual cartão foi clicado.
  function handleClick() {
    onCardClick(card);
  }

  function handleLikeClick() {
    onCardLike(card);
  }

  function handleDeleteClick() {
    onCardDelete(card);
  }

  return (
    <li className='card'>
      <img
        alt={name}
        className='card__image'
        src={link}
        onClick={handleClick}
      />
      {isOwn && (
        <button
          aria-label='Excluir cartão'
          className='card__delete-button'
          type='button'
          onClick={handleDeleteClick}
        />
      )}
      <div className='card__description'>
        <h2 className='card__title'>{name}</h2>
        <button
          aria-label='Curtir cartão'
          className={cardLikeButtonClassName}
          type='button'
          onClick={handleLikeClick}
        />
      </div>
    </li>
  );
}
