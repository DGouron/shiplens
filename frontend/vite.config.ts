import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const apiProxy = {
  target: 'http://localhost:3000',
  changeOrigin: true,
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
