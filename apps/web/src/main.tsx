import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './global.css.ts'
import { routeTree } from './routeTree.gen.ts'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/**
 * Список приезжает одним запросом и стоит запуска `bd` на всём проекте,
 * поэтому возврат в окно его не перезапрашивает: данные трекера меняются
 * медленнее, чем человек переключает вкладки.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false }
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
