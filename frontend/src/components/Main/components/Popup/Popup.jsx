import { useEffect } from 'react';

export default function Popup(props) {
  // children é o conteúdo do pop-up; onClose vem do App e volta o estado do
  // pop-up para null. type escolhe o formato do quadro: sem type, o
  // formulário; 'image', a imagem ampliada; 'tooltip', o aviso do cadastro
  // e do login.
  const { onClose, title, type, children } = props;

  // Esc fecha. O ouvinte só existe enquanto o pop-up está na tela: a função
  // devolvida pelo efeito o remove quando o pop-up sai.
  useEffect(() => {
    function handleEscClose(evt) {
      if (evt.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscClose);
    return () => document.removeEventListener('keydown', handleEscClose);
  }, [onClose]);

  // Clique no fundo escuro fecha; clique dentro do quadro, não.
  function handleOverlayClick(evt) {
    if (evt.target === evt.currentTarget) {
      onClose();
    }
  }

  return (
    <div className='popup' onMouseDown={handleOverlayClick}>
      <div
        className={`popup__content ${
          type ? `popup__content_content_${type}` : ''
        }`}
      >
        <button
          aria-label='Fechar pop-up'
          className='popup__close'
          type='button'
          onClick={onClose}
        />
        {title && <h3 className='popup__title'>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
