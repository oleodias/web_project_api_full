// O JWT fica no localStorage, para o usuário não precisar entrar de novo a
// cada visita. Uma chave só, em um lugar só.
const TOKEN_KEY = 'jwt';

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

// null quando não há token salvo
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);
