import type { IssueView } from '@beadle/protocol'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useCallback } from 'react'

import { issuesQuery } from './api.ts'
import { Failure } from './failure.tsx'
import { Notice } from './notice.tsx'

/** Раскладка проекта: от неё виды берут и проект, и фильтры из адреса. */
export const WORKSPACE_ROUTE = '/w/$slug'

/**
 * Обвязка вида: один запрос на проект и три состояния вокруг него. Виды
 * различаются только тем, как рисуют задачи, поэтому ожидание, отказ
 * и пустой результат живут здесь, а не повторяются в каждом маршруте.
 */
export function IssuesPane({
  children
}: {
  children: (issues: readonly IssueView[]) => ReactNode
}) {
  const { slug } = useParams({ from: WORKSPACE_ROUTE })
  const search = useSearch({ from: WORKSPACE_ROUTE })
  const navigate = useNavigate({ from: WORKSPACE_ROUTE })

  const { data, status, error } = useQuery(issuesQuery(slug, search))

  const reset = useCallback(() => {
    void navigate({ search: {}, replace: true })
  }, [navigate])

  if (status === 'error') {
    return <Failure error={error} onReset={reset} />
  }
  if (status === 'pending') {
    return <Notice>Спрашиваю у bd…</Notice>
  }
  if (data.issues.length === 0) {
    return <Notice>Под фильтры ничего не попало.</Notice>
  }
  return <>{children(data.issues)}</>
}
