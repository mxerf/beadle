import { Link, useParams, useSearch } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { WORKSPACE_ROUTE } from './issues-pane.tsx'

/**
 * Ссылка на страницу задачи из любого вида. Фильтры едут с собой: со страницы
 * задачи «назад» обязано вернуть к тому же отбору, из которого сюда пришли,
 * а не к полному списку проекта.
 */
export function IssueRoute({
  id,
  className,
  title,
  children
}: {
  id: string
  className: string
  /** Подсказка при наведении: там, где в строке для пояснения нет места. */
  title?: string | undefined
  children: ReactNode
}) {
  const { slug } = useParams({ from: WORKSPACE_ROUTE })
  const search = useSearch({ from: WORKSPACE_ROUTE })

  return (
    <Link
      to="/w/$slug/issue/$id"
      params={{ slug, id }}
      search={search}
      className={className}
      title={title}
    >
      {children}
    </Link>
  )
}
