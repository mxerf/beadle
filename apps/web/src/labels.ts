import type { Label } from '@beadle/protocol'

/** Сколько лейблов видно сразу: в живом проекте их под четыре десятка. */
export const LABELS_AT_ONCE = 12

/**
 * Какие лейблы показать в панели. По частоте, а не по алфавиту: сверху те,
 * которыми помечено больше задач. Хвост редких убран за «ещё», но выбранный
 * лейбл виден всегда — иначе включённый фильтр нечем выключить. Лейбл
 * из адреса, которого в проекте уже нет, тоже показан: ссылка могла
 * устареть, а снять отбор всё равно нужно.
 *
 * @param all Показать весь список, а не первые `LABELS_AT_ONCE`.
 */
export function pickLabels(
  labels: readonly Label[],
  selected: readonly string[],
  all: boolean
): { shown: string[]; hidden: number } {
  const known = labels
    .toSorted((a, b) => b.count - a.count)
    .map((label) => label.name)
  const visible = all
    ? known
    : known.filter(
        (name, index) => index < LABELS_AT_ONCE || selected.includes(name)
      )
  const strangers = selected.filter((name) => !known.includes(name))

  return {
    shown: [...visible, ...strangers],
    hidden: known.length - visible.length
  }
}
