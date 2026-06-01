import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@engines': resolve(__dirname, 'src/engines'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@screens': resolve(__dirname, 'src/screens'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@games': resolve(__dirname, 'src/games'),
      '@theme': resolve(__dirname, 'src/theme'),
    },
  },
});
