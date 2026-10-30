// O endereço da API própria (a pasta backend/ deste repositório).
// Em desenvolvimento, o back-end roda em http://localhost:3000. Para o
// build que vai para o servidor, a variável VITE_API_URL aponta para o
// subdomínio da API (ver o README). Não é um segredo: o navegador de quem
// usa o site vê esse endereço de qualquer jeito.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
