import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './components/App.jsx';

// Sem o <StrictMode>: em desenvolvimento ele monta os componentes duas vezes,
// e as solicitações iniciais apareceriam em dobro na aba Rede. O checklist
// pede que usuário e cartões sejam pedidos uma vez só.
// As duas flags "future" antecipam o comportamento do React Router 7 e
// evitam os avisos que a versão 6 escreve no console.
createRoot(document.getElementById('root')).render(
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <App />
  </BrowserRouter>,
);
