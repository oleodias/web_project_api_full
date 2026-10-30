import { useContext, useState } from 'react';
import CurrentUserContext from '../../../../../../contexts/CurrentUserContext.js';

export default function NewCard(props) {
  const { onAddPlaceSubmit } = props;
  const { isLoading } = useContext(CurrentUserContext);

  // Componentes controlados, começando vazios.
  const [name, setName] = useState('');
  const [link, setLink] = useState('');

  function handleNameChange(evt) {
    setName(evt.target.value);
  }

  function handleLinkChange(evt) {
    setLink(evt.target.value);
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    onAddPlaceSubmit({ name, link });
  }

  return (
    <form
      className='popup__form'
      id='new-card-form'
      name='card-form'
      onSubmit={handleSubmit}
    >
      <input
        className='popup__input popup__input_type_card-name'
        id='card-name-input'
        maxLength='30'
        minLength='2'
        name='name'
        placeholder='Título'
        required
        type='text'
        value={name}
        onChange={handleNameChange}
      />
      <span className='popup__error' id='card-name-input-error'></span>
      <input
        className='popup__input popup__input_type_url'
        id='link-input'
        name='link'
        placeholder='URL da Imagem'
        required
        type='url'
        value={link}
        onChange={handleLinkChange}
      />
      <span className='popup__error' id='link-input-error'></span>
      <button className='button popup__button' type='submit'>
        {isLoading ? 'Salvando...' : 'Criar'}
      </button>
    </form>
  );
}
