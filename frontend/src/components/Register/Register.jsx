import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register(props) {
  const { onRegister } = props;

  // Componentes controlados: o valor dos campos vem do estado.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleEmailChange(evt) {
    setEmail(evt.target.value);
  }

  function handlePasswordChange(evt) {
    setPassword(evt.target.value);
  }

  // A solicitação à API fica no App: aqui o formulário só entrega os dados.
  function handleSubmit(evt) {
    evt.preventDefault();
    onRegister({ email, password });
  }

  return (
    <section className='auth'>
      <h2 className='auth__title'>Inscrever-se</h2>
      <form className='auth__form' name='register' onSubmit={handleSubmit}>
        <input
          autoComplete='email'
          className='auth__input'
          name='email'
          placeholder='E-mail'
          required
          type='email'
          value={email}
          onChange={handleEmailChange}
        />
        <input
          autoComplete='new-password'
          className='auth__input'
          name='password'
          placeholder='Senha'
          required
          type='password'
          value={password}
          onChange={handlePasswordChange}
        />
        <button className='auth__button' type='submit'>
          Inscrever-se
        </button>
      </form>
      <p className='auth__text'>
        Já é um membro?{' '}
        <Link className='auth__link' to='/signin'>
          Faça o login aqui!
        </Link>
      </p>
    </section>
  );
}
