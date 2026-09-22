import {
  type IssueStatus,
  issueStatusSchema,
  type IssueType,
  issueTypeSchema
} from '@beadle/protocol'

/**
 * Подписи к значениям контракта. Списки берутся из схем, а не переписываются
 * руками: новый статус в beads должен проявиться в фильтрах сам, а не через
 * забытую константу.
 */

export const STATUSES = issueStatusSchema.options
export const TYPES = issueTypeSchema.options
export const PRIORITIES = [0, 1, 2, 3, 4] as const

export const statusCaption: Record<IssueStatus, string> = {
  open: 'открыта',
  in_progress: 'в работе',
  deferred: 'отложена',
  closed: 'закрыта'
}

export const typeCaption: Record<IssueType, string> = {
  task: 'задача',
  bug: 'баг',
  feature: 'фича',
  epic: 'эпик',
  chore: 'рутина',
  decision: 'решение',
  story: 'история',
  spike: 'разведка',
  milestone: 'веха'
}

/** Приоритет показывается как P0–P4: так он выглядит и в `bd`. */
export function priorityCaption(priority: number): string {
  return `P${priority}`
}

/**
 * Русское склонение при числе: «1 задача», «2 задачи», «5 задач».
 * Английская форма «467 задач(и)» в читалке на русском выглядит как недоделка.
 */
export function plural(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const tens = count % 100
  if (tens >= 11 && tens <= 14) {
    return many
  }
  const ones = count % 10
  if (ones === 1) {
    return one
  }
  return ones >= 2 && ones <= 4 ? few : many
}
