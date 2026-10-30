import { useContext } from 'react';
import CurrentUserContext from '../../../../../../contexts/CurrentUserContext.js';

export default function RemoveCard(props) {
  const { card, onCardDelete } = props;
  const { isLoading } = useContext(CurrentUserContext);

  function handleSubmit(evt) {
    evt.preventDefault();
    onCardDelete(card);
  }

  return (
    <form
      className='popup__form popup__form_type_confirm'
      id='confirm-form'
      name='confirm-form'
      onSubmit={handleSubmit}
    >
      <button
        className='button popup__button popup__button_type_compact'
        type='submit'
      >
        {isLoading ? 'Excluindo...' : 'Sim'}
      </button>
    </form>
  );
}
