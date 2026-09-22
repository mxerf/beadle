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

/** Отбор: эта часть адреса уезжает на сервер и попадает в ключ кеша. */
export const issueFilterSearchSchema = z.object({
  status: fromUrl,
  type: fromUrl,
  priority: fromUrl,
  label: fromUrl,
  assignee: fromUrl,
  parent: fromUrl,
  search: fromUrl
})

/**
 * Весь адрес вида: к отбору добавлено то, как его разложить. Показ живёт
 * в адресе на тех же правах, что и фильтры, — ссылка должна открываться
 * ровно тем экраном, с которого её дали, — но на сервер он не едет:
 * от перегруппировки набор задач не меняется, а значит и спрашивать `bd`
 * заново не о чем.
 */
export const issueSearchSchema = issueFilterSearchSchema.extend({
  group: fromUrl
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

/**
 * Запрос к серверу. Что относится к отбору, перечислено один раз — в схеме
 * фильтров, и лишнее отсекает она сама: новый параметр показа не просочится
 * в запрос и не разорвёт кеш только потому, что про него забыли здесь.
 */
export function toQueryString(search: IssueSearch): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(
    issueFilterSearchSchema.parse(search)
  )) {
    if (value) {
      params.set(key, value)
    }
  }
  return params.toString()
}
