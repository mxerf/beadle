import { z } from 'zod'

/**
 * Фильтры в адресе страницы и в запросе к серверу — одно и то же:
 * `?status=open,in_progress&priority=0,1`. Списки держим строкой через запятую,
 * а не массивом, потому что массив маршрутизатор кодирует в JSON, и ссылка
 * перестаёт читаться человеком — ради читаемых ссылок проект и затеян.
 */
/**
 * Значение из адреса. Приводится к строке ремнём безопасности: разбор
 * (`parseSearch` ниже) отдаёт строки всегда, но путь от адреса до экрана
 * длинный, и молча уронить его из-за числа дороже одного `String()`.
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
  search: fromUrl,
  ready: fromUrl
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

/**
 * Разбор адреса. Написан свой, а не взят `parseSearchWith`: тот прогоняет
 * строку через декодер, который **до** всякого своего разбора приводит
 * `1`, `0` и `true` к числу и булеву. Дальше по коду это лечилось приведением
 * к строке, но сам маршрутизатор продолжал видеть сырое значение и сравнивать
 * его со строковым — и переставал узнавать текущий вид, стоило появиться
 * в адресе фильтру с числом. Здесь значения остаются такими, какими человек
 * их написал в ссылке.
 */
export function parseSearch(raw: string): Record<string, string> {
  const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw)
  const search: Record<string, string> = {}

  for (const [key, value] of params) {
    search[key] = value
  }

  return search
}

/**
 * Обратная сборка. Запятая в списке возвращается на место: в запросе адреса
 * она законна (RFC 3986), а `%2C` в ссылке, которой делятся, читать невозможно.
 */
export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    // В адрес попадает только простое значение. Объект здесь — ошибка кода,
    // и `[object Object]` в ссылке спрятал бы её вместо того, чтобы показать.
    const text = toText(value)
    if (text !== undefined) {
      params.set(key, text)
    }
  }

  const query = params.toString().replaceAll('%2C', ',')
  return query === '' ? '' : `?${query}`
}

function toText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value === '' ? undefined : value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return undefined
}

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
/**
 * Флаг из адреса. Понимает обе записи, потому что сервер понимает обе:
 * иначе ссылка с `?ready=true` отбирала бы задачи, а таблетка в панели
 * показывала бы, что отбор выключен.
 */
export function toFlag(raw: string | undefined): boolean {
  return raw === '1' || raw === 'true'
}

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
