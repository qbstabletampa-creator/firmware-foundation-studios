import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Firmware Foundation Studios',
        short_name: 'Gosple',
        description: 'Faith-driven games for the whole family',
        start_url: '/gosple',
        display: 'standalone',
        background_color: '#10100E',
        theme_color: '#10100E',
        icons: [
          { src: '/gosple-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
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
