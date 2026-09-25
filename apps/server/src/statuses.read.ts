import {
  type Status,
  type StatusCategory,
  statusCategorySchema
} from '@beadle/protocol'
import { z } from 'zod'

import { BdError, runBdJson, runBdText } from './bd.ts'

/**
 * Словарь статусов проекта: какие допустимы и в каком порядке задача их
 * проходит. Спрашивается у `bd`, а не переписан руками: свои статусы
 * у каждого проекта свои, и встроенные между версиями `bd` тоже меняются.
 */

const bdStatusSchema = z.object({
  name: z.string(),
  // Категория, которой beadle ещё не знает, не должна гасить весь словарь:
  // статус остаётся допустимым, а показывается как статус без смысла.
  category: statusCategorySchema.catch('unspecified')
})

/** Без своих статусов `bd` не кладёт ключ `custom_statuses` вовсе. */
const bdStatusesSchema = z.object({
  built_in_statuses: z.array(bdStatusSchema),
  custom_statuses: z.array(bdStatusSchema).default([])
})

type BdStatus = z.infer<typeof bdStatusSchema>

/**
 * Порядок категорий — путь задачи: от «можно брать» через работу к льду
 * и закрытию. Статус без категории `bd` показывает в списке по умолчанию,
 * как работу, поэтому и место ему рядом с ней.
 */
const CATEGORY_ORDER: readonly StatusCategory[] = [
  'active',
  'wip',
  'unspecified',
  'frozen',
  'done'
]

/**
 * Имена своих статусов в том порядке, в каком их записали в конфиг:
 * `awaiting_staging:wip,awaiting_prod:wip`. Из строки берутся только имена.
 * Непонятная строка (`status.custom (not set)`) даёт имена, которых нет
 * в словаре, и порядок просто остаётся тем, что отдал `bd`.
 */
export function configuredOrder(raw: string): string[] {
  return raw
    .split(',')
    .map((entry) => entry.split(':')[0]?.trim() ?? '')
    .filter(Boolean)
}

/**
 * Один список из двух. Внутри категории встроенные идут первыми в порядке
 * `bd`, свои — в порядке конфига. `bd` свои сортирует по алфавиту, а для
 * этапов конвейера алфавит — это «ждёт прода» раньше «ждёт стенда».
 */
export function orderStatuses(
  builtIn: readonly BdStatus[],
  custom: readonly BdStatus[],
  configured: readonly string[]
): Status[] {
  const position = (name: string): number => {
    const index = configured.indexOf(name)
    return index === -1 ? configured.length : index
  }

  const all: Status[] = [
    ...builtIn.map((status) => ({ ...status, custom: false })),
    ...custom
      .toSorted((a, b) => position(a.name) - position(b.name))
      .map((status) => ({ ...status, custom: true }))
  ]

  // Сортировка устойчивая: внутри категории остаётся порядок, собранный выше.
  return all.toSorted(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  )
}

export async function readStatuses(cwd: string): Promise<Status[]> {
  const args = ['statuses', '--json']
  // Порядок своих статусов есть только в конфиге: `bd statuses` его теряет.
  const [raw, configured] = await Promise.all([
    runBdJson(cwd, args),
    runBdText(cwd, ['config', 'get', 'status.custom'])
  ])

  const parsed = bdStatusesSchema.safeParse(raw)
  if (!parsed.success) {
    throw new BdError(
      `bd ${args.join(' ')} ответил не словарём статусов`,
      cwd,
      args
    )
  }

  return orderStatuses(
    parsed.data.built_in_statuses,
    parsed.data.custom_statuses,
    configuredOrder(configured)
  )
}
