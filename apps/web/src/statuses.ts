import type { IssueView, Status } from '@beadle/protocol'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { statusesQuery } from './api.ts'

/** Одна пустая ссылка на все ожидания: новый массив на каждый рендер — это новый словарь. */
const NONE: readonly Status[] = []

/**
 * Словарь статусов открытого проекта. Проект берётся из адреса, а не
 * протягивается пропсами: тег статуса стоит в каждом виде и на странице
 * задачи, и везде проект один — тот, что в пути. Пока словарь едет,
 * ответ пустой: теги серые, а не упавшие.
 */
export function useStatuses(): readonly Status[] {
  const { slug } = useParams({ strict: false })
  if (slug === undefined) {
    throw new Error('словарь статусов спрашивают только внутри проекта')
  }
  const { data } = useQuery(statusesQuery(slug))
  return data ?? NONE
}

/**
 * Порядок статусов для раскладки: словарь проекта, а за ним — статусы,
 * которые есть у задач, но пропали из словаря. Такой статус убрали
 * из конфига, а задачи в нём остались, и раскладка по словарю молча
 * потеряла бы их с доски.
 */
export function statusOrder(
  statuses: readonly Status[],
  issues: readonly IssueView[]
): string[] {
  const known = new Set(statuses.map((status) => status.name))
  const orphans = new Set(
    issues.map((issue) => issue.status).filter((name) => !known.has(name))
  )
  return [...known, ...[...orphans].toSorted()]
}
