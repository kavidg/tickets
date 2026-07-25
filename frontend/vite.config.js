import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // SPA fallback: all routes serve index.html so BrowserRouter works
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
