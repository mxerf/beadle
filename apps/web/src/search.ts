import { z } from 'zod'

/**
 * Фильтры в адресе страницы и в запросе к серверу — одно и то же:
 * `?status=open,in_progress&priority=0,1`. Списки держим строкой через запятую,
 * а не массивом, потому что массив маршрутизатор кодирует в JSON, и ссылка
 * перестаёт читаться человеком — ради читаемых ссылок проект и затеян.
 */
/**
 * Значение из адреса. Строкой оно доезжает не всегда: маршрутизатор разбирает
 * каждый параметр как JSON, и `?priority=0` приходит числом, а `?priority=0,1`
 * — строкой, потому что JSON его не понял. Без приведения выбор одного
 * приоритета роняет разбор адреса целиком.
 */
const fromUrl = z
  .union([z.string(), z.number(), z.boolean()])
  .transform(String)
  .optional()

export const issueSearchSchema = z.object({
  status: fromUrl,
  type: fromUrl,
  priority: fromUrl,
  label: fromUrl,
  assignee: fromUrl,
  parent: fromUrl,
  search: fromUrl
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
