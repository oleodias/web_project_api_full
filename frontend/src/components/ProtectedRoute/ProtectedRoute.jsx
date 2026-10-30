import { Navigate } from 'react-router-dom';

// Envolve as rotas que só existem para quem entrou. Sem login, o usuário vai
// para /signin, qualquer que seja a rota pedida. A proteção é de interface:
// quem protege os dados de verdade é o servidor, que recusa um token inválido.
export default function ProtectedRoute(props) {
  const { isLoggedIn, children } = props;

  if (!isLoggedIn) {
    return <Navigate to='/signin' replace />;
  }

  return children;
}
