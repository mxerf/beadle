import type { Issue } from '@beadle/protocol'

/**
 * Порядок задач во всех видах: сначала приоритет, при равном — свежесть.
 * `bd` отдаёт задачи в своём порядке, а человеку нужен верх списка: самое
 * срочное должно быть видно без прокрутки, и одинаково в списке и на доске.
 */
export function byImportance(a: Issue, b: Issue): number {
  return a.priority - b.priority || b.updated_at.localeCompare(a.updated_at)
}
