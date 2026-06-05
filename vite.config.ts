import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: true, // bind to 0.0.0.0 so phones on the LAN / Tailscale can reach the dev server
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: 'Firmware Foundation Studios',
        short_name: 'FFS Games',
        description: 'Faith-driven games for the whole family',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#10100E',
        theme_color: '#10100E',
        categories: ['games', 'entertainment'],
        icons: [
          { src: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
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
