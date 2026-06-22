import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || '/api';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: apiUrl.startsWith('/')
        ? {
            [apiUrl]: {
              target: 'http://localhost:3001',
              changeOrigin: true,
              rewrite: (p) => p.replace(new RegExp(`^${apiUrl}`), '/api'),
            },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
    },
    define: {
      __API_URL__: JSON.stringify(apiUrl),
    },
  };
});
