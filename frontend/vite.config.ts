import { type IncomingMessage } from 'node:http';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const bypassPageNavigations = (req: IncomingMessage): string | undefined => {
  const acceptHeader = req.headers.accept ?? '';
  if (req.method === 'GET' && acceptHeader.includes('text/html')) {
    return req.url;
  }
  return undefined;
};

const apiProxy = {
  target: 'http://localhost:3000',
  changeOrigin: true,
  bypass: bypassPageNavigations,
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/dashboard/data': apiProxy,
      '/analytics': apiProxy,
      '/api': apiProxy,
      '/settings': apiProxy,
      '/sync': apiProxy,
      '/linear': apiProxy,
      '/webhooks': apiProxy,
      '/notifications': apiProxy,
    },
  },
});
