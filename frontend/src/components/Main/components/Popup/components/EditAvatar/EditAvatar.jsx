import { useContext, useRef } from 'react';
import CurrentUserContext from '../../../../../../contexts/CurrentUserContext.js';

export default function EditAvatar() {
  const { handleUpdateAvatar, isLoading } = useContext(CurrentUserContext);

  // Não controlado: o valor fica no próprio campo, e a ref dá acesso direto
  // a ele no envio.
  const avatarRef = useRef();

  function handleSubmit(evt) {
    evt.preventDefault();
    handleUpdateAvatar({ avatar: avatarRef.current.value });
  }

  return (
    <form
      className='popup__form'
      id='avatar-form'
      name='avatar-form'
      onSubmit={handleSubmit}
    >
      <input
        className='popup__input popup__input_type_url'
        id='avatar-input'
        name='avatar'
        placeholder='Link da foto'
        ref={avatarRef}
        required
        type='url'
      />
      <span className='popup__error' id='avatar-input-error'></span>
      <button
        className='button popup__button popup__button_type_compact'
        type='submit'
      >
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
