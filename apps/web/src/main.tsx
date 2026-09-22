import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  parseSearchWith,
  RouterProvider,
  stringifySearchWith
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ApiError } from './api.ts'
import './global.css.ts'
import { routeTree } from './routeTree.gen.ts'

/**
 * Параметры адреса — простые строки, без JSON.
 *
 * По умолчанию маршрутизатор гоняет каждое значение через `JSON.parse`
 * и `JSON.stringify`: `?priority=0` приезжает числом и валит разбор, а строка
 * `'0'` уезжает обратно как `?priority=%220%22`. Читаемая ссылка — то, ради
 * чего проект и написан, поэтому разбор заменён на тождественный: адрес
 * выглядит и передаётся так же, как его принимает сервер.
 */
const router = createRouter({
  routeTree,
  parseSearch: parseSearchWith((value) => value),
  stringifySearch: stringifySearchWith(String)
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/**
 * Список приезжает одним запросом и стоит запуска `bd` на всём проекте,
 * поэтому возврат в окно его не перезапрашивает: данные трекера меняются
 * медленнее, чем человек переключает вкладки.
 *
 * Отказ из-за запроса (битый фильтр в адресе) не переспрашивается: повтор
 * его не починит, а человек всё это время смотрит на «спрашиваю у bd».
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        error instanceof ApiError && error.status < 500
          ? false
          : failureCount < 2
    }
  }
})

const container = document.querySelector('#root')
if (!container) {
  throw new Error('в index.html нет #root — монтировать некуда')
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
