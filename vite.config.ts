import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.jpg', 'school_logo.jpg', 'school_logo.png'],
        manifest: {
          short_name: 'منصة السعيد',
          name: 'منصة السعيد',
          icons: [
            {
              src: '/school_logo.png',
              type: 'image/png',
              sizes: '192x192',
              purpose: 'any maskable'
            },
            {
              src: '/school_logo.png',
              type: 'image/png',
              sizes: '512x512',
              purpose: 'any maskable'
            }
          ],
          start_url: '/',
          background_color: '#ffffff',
          theme_color: '#10b981',
          display: 'standalone',
          orientation: 'portrait'
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
