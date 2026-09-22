import { useMatchRoute } from '@tanstack/react-router'

/**
 * Виды проекта. Вид — часть адреса, как проект и фильтры: доска, открытая
 * по ссылке, открывается доской.
 */
export const VIEWS = [
  { to: '/w/$slug', caption: 'Список' },
  { to: '/w/$slug/board', caption: 'Доска' },
  { to: '/w/$slug/epics', caption: 'Эпики' }
] as const

/**
 * Название открытого вида. Спрашивается у маршрутизатора, а не выводится
 * из адреса руками: разбор пути — его работа, и повторять её значит
 * заводить второе мнение о том, что сейчас на экране.
 */
export function useViewCaption(slug: string): string | undefined {
  const matchRoute = useMatchRoute()

  return VIEWS.find((view) =>
    // Без `fuzzy` список совпал бы и на доске: его путь — начало их путей.
    matchRoute({ to: view.to, params: { slug }, fuzzy: false })
  )?.caption
}
