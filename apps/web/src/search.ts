import { z } from 'zod'

/**
 * Фильтры в адресе страницы и в запросе к серверу — одно и то же:
 * `?status=open,in_progress&priority=0,1`. Списки держим строкой через запятую,
 * а не массивом, потому что массив маршрутизатор кодирует в JSON, и ссылка
 * перестаёт читаться человеком — ради читаемых ссылок проект и затеян.
 */
export const issueSearchSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  label: z.string().optional(),
  assignee: z.string().optional(),
  parent: z.string().optional(),
  search: z.string().optional()
})

export type IssueSearch = z.infer<typeof issueSearchSchema>

export function toValues(raw: string | undefined): string[] {
  return raw ? raw.split(',').filter(Boolean) : []
}

/**
 * Включает или выключает значение в списке фильтра. Пустой список — это
 * отсутствие параметра, а не пустая строка: иначе в адресе копится `&type=`.
 */
export function toggleValue(
  raw: string | undefined,
  value: string
): string | undefined {
  const values = toValues(raw)
  const next = values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
  return next.length > 0 ? next.join(',') : undefined
}

export function toQueryString(search: IssueSearch): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (value) {
      params.set(key, value)
    }
  }
  return params.toString()
}
