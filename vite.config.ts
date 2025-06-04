import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SpeakFlow',
        short_name: 'SpeakFlow',
        description: 'Application de traduction vocale en temps réel pour les sapeurs-pompiers',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/translation\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'translation-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semaine
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/vision\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'vision-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semaine
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
  
  // Définir les variables d'environnement pour le client
  define: {
    'process.env.GOOGLE_CLOUD_API_KEY': JSON.stringify(env.GOOGLE_CLOUD_API_KEY || ''),
    'process.env.GOOGLE_CLOUD_PROJECT_ID': JSON.stringify(env.GOOGLE_CLOUD_PROJECT_ID || '')
  }
};
})
