import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login(props) {
  const { onLogin } = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleEmailChange(evt) {
    setEmail(evt.target.value);
  }

  function handlePasswordChange(evt) {
    setPassword(evt.target.value);
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    onLogin({ email, password });
  }

  return (
    <section className='auth'>
      <h2 className='auth__title'>Entrar</h2>
      <form className='auth__form' name='login' onSubmit={handleSubmit}>
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
          autoComplete='current-password'
          className='auth__input'
          name='password'
          placeholder='Senha'
          required
          type='password'
          value={password}
          onChange={handlePasswordChange}
        />
        <button className='auth__button' type='submit'>
          Entrar
        </button>
      </form>
      <p className='auth__text'>
        Ainda não é membro?{' '}
        <Link className='auth__link' to='/signup'>
          Inscreva-se aqui!
        </Link>
      </p>
    </section>
  );
}
