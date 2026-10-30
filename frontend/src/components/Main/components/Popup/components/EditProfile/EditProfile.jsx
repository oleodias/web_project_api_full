import { useContext, useState } from 'react';
import CurrentUserContext from '../../../../../../contexts/CurrentUserContext.js';

export default function EditProfile() {
  const { currentUser, handleUpdateUser, isLoading } =
    useContext(CurrentUserContext);

  // Componentes controlados: o valor dos campos vem do estado, que começa com
  // os dados do usuário atual.
  const [name, setName] = useState(currentUser.name);
  const [description, setDescription] = useState(currentUser.about);

  function handleNameChange(evt) {
    setName(evt.target.value);
  }

  function handleDescriptionChange(evt) {
    setDescription(evt.target.value);
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    // A API espera "about"; o estado se chama description.
    handleUpdateUser({ name, about: description });
  }

  return (
    <form
      className='popup__form'
      id='edit-profile-form'
      name='profile-form'
      onSubmit={handleSubmit}
    >
      <input
        className='popup__input popup__input_type_name'
        id='name-input'
        maxLength='40'
        minLength='2'
        name='name'
        placeholder='Nome'
        required
        type='text'
        value={name}
        onChange={handleNameChange}
      />
      <span className='popup__error' id='name-input-error'></span>
      <input
        className='popup__input popup__input_type_description'
        id='description-input'
        maxLength='200'
        minLength='2'
        name='about'
        placeholder='Sobre mim'
        required
        type='text'
        value={description}
        onChange={handleDescriptionChange}
      />
      <span className='popup__error' id='description-input-error'></span>
      <button className='button popup__button' type='submit'>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
