import {
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
    readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Сервер объясняет отказ полем `message`; показываем его, а не код. */
function describeFailure(body: unknown, status: number): string {
  if (typeof body === 'object' && body !== null) {
    const { message, error } = body as { message?: unknown; error?: unknown }
    if (typeof message === 'string') {
      return message
    }
    if (typeof error === 'string') {
      return error
    }
  }
  return `сервер ответил ${status}`
}

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(path)
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined)
    throw new ApiError(describeFailure(body, response.status), response.status)
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
