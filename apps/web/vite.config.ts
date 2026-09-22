import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Порт сервера по умолчанию: тот же, что в `apps/server/src/index.ts`. */
const API = 'http://127.0.0.1:4200'

export default defineConfig({
  plugins: [
    // Порядок обязателен: плагин маршрутов идёт до react, иначе дерево
    // маршрутов не собирается и ошибки об этом не будет.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      // Стили лежат рядом с компонентом маршрута, но маршрутом не являются:
      // без этого `w.$slug.css.ts` уехал бы в дерево отдельной страницей.
      routeFileIgnorePattern: '\\.css\\.ts$'
    }),
    react(),
    vanillaExtractPlugin()
  ],
  server: {
    port: 4201,
    proxy: { '/api': API }
  }
})
