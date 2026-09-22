import {
  errorResponseSchema,
  type FilterProblem,
  type IssueDetailResponse,
  issueDetailResponseSchema,
  type IssuesResponse,
  issuesResponseSchema,
  type Workspace,
  workspacesResponseSchema
} from '@beadle/protocol'
import { queryOptions } from '@tanstack/react-query'

import { type IssueSearch, toQueryString } from './search.ts'

/**
 * Доступ к серверу. Запросы идут на свой же адрес — в деве их проксирует vite,
 * в сборке фронт раздаёт тот же процесс, поэтому базового URL нет и не нужно.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Машинный код отказа: по нему страница подбирает объяснение. */
    readonly code: string,
    /** Что именно не разобралось: поля фильтров из адреса. */
    readonly fields: readonly FilterProblem[] = []
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(path)

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined)
    const failure = errorResponseSchema.safeParse(body)

    if (!failure.success) {
      throw new ApiError(
        `сервер ответил ${response.status}`,
        response.status,
        'unknown'
      )
    }

    const { error, message, fields } = failure.data
    throw new ApiError(message ?? error, response.status, error, fields ?? [])
  }

  return response.json()
}

export const workspacesQuery = queryOptions({
  queryKey: ['workspaces'],
  queryFn: async (): Promise<Workspace[]> => {
    const body = await getJson('/api/workspaces')
    return workspacesResponseSchema.parse(body).workspaces
  }
})

/**
 * Задачи одного проекта. Воркспейс — часть пути, а не состояние сервера,
 * поэтому он же часть ключа кеша: две вкладки с разными проектами не делят
 * между собой ни адрес, ни данные.
 */
export function issuesQuery(slug: string, search: IssueSearch) {
  const query = toQueryString(search)
  return queryOptions({
    queryKey: ['issues', slug, query],
    queryFn: async (): Promise<IssuesResponse> => {
      const body = await getJson(`/api/w/${slug}/issues?${query}`)
      return issuesResponseSchema.parse(body)
    }
  })
}

/** Подробности одной задачи: отдельный вызов `bd show` на стороне сервера. */
export function issueQuery(slug: string, id: string) {
  return queryOptions({
    queryKey: ['issue', slug, id],
    queryFn: async (): Promise<IssueDetailResponse> => {
      const body = await getJson(
        `/api/w/${slug}/issues/${encodeURIComponent(id)}`
      )
      return issueDetailResponseSchema.parse(body)
    }
  })
}
