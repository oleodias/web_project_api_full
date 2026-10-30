import Popup from '../Main/components/Popup/Popup.jsx';
import successIcon from '../../images/success.svg';
import errorIcon from '../../images/error.svg';

// O aviso do cadastro e do login usa a mesma moldura dos outros pop-ups (X,
// Esc, clique no fundo), com o modificador de tamanho e alinhamento dele.
export default function InfoTooltip(props) {
  const { isSuccess, onClose } = props;

  return (
    <Popup onClose={onClose} type='tooltip'>
      <img
        alt={isSuccess ? 'Sucesso' : 'Erro'}
        className='popup__icon'
        src={isSuccess ? successIcon : errorIcon}
      />
      <p className='popup__message'>
        {isSuccess
          ? 'Vitória! Você se registrou.'
          : 'Ops, algo deu errado! Por favor, tente novamente.'}
      </p>
    </Popup>
  );
}
