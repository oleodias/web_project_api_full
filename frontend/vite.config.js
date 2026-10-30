import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
// A porta 3000 agora é do back-end (Express); o front de desenvolvimento usa
// a porta padrão da Vite.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
