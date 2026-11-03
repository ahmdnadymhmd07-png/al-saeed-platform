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
        injectRegister: 'auto',
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
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                networkTimeoutSeconds: 3
              }
            },
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-data-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // حفظ البيانات لمدة أسبوع
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
