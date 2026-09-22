import {
  type Issue,
  type IssueDetail,
  issueDetailSchema,
  type IssueFilters,
  issueSchema,
  type IssueView
} from '@beadle/protocol'

import { runBdJson } from './bd.ts'

/**
 * Чтение задач: `bd` отдаёт весь список разом (467 задач — 1.76 МБ за 0.4 с),
 * поэтому фильтрация идёт здесь, а не отдельными вызовами CLI на каждый вид.
 * Один вызов на запрос дешевле пяти, и картина остаётся согласованной.
 */

export async function readIssues(cwd: string): Promise<Issue[]> {
  const raw = await runBdJson(cwd, ['list', '--all', '--json'])
  const parsed = issueSchema.array().safeParse(raw)

  if (!parsed.success) {
    // Незнакомое поле или новый статус не должны гасить весь список:
    // разбираем по одной и выбрасываем только то, что не читается.
    const items = Array.isArray(raw) ? raw : []
    return items.flatMap((item) => {
      const one = issueSchema.safeParse(item)
      return one.success ? [one.data] : []
    })
  }

  return parsed.data
}

/**
 * Подробности одной задачи. Отдельный вызов `bd`, а не выборка из списка:
 * список не везёт комментарии и не раскрывает связи в задачи — только рёбра.
 *
 * Промах по номеру `bd` показывает не кодом возврата, а объектом с полем
 * `error` вместо массива: отличаем по форме ответа.
 */
export async function readIssue(
  cwd: string,
  id: string
): Promise<IssueDetail | undefined> {
  const raw = await runBdJson(cwd, [
    'show',
    id,
    '--json',
    '--include-comments',
    '--include-dependents'
  ])

  if (!Array.isArray(raw)) {
    return undefined
  }

  const parsed = issueDetailSchema.safeParse(raw[0])
  return parsed.success ? parsed.data : undefined
}

function matchesSearch(issue: Issue, needle: string): boolean {
  const haystack = [issue.id, issue.title, issue.description ?? '']
    .join('\n')
    .toLowerCase()
  return haystack.includes(needle.toLowerCase())
}

export function applyFilters(
  issues: readonly Issue[],
  filters: IssueFilters
): Issue[] {
  return issues.filter((issue) => {
    if (filters.status && !filters.status.includes(issue.status)) {
      return false
    }
    if (filters.type && !filters.type.includes(issue.issue_type)) {
      return false
    }
    if (filters.priority && !filters.priority.includes(issue.priority)) {
      return false
    }
    if (filters.label && !filters.label.some((l) => issue.labels.includes(l))) {
      return false
    }
    if (filters.assignee && issue.assignee !== filters.assignee) {
      return false
    }
    if (filters.parent && issue.parent !== filters.parent) {
      return false
    }
    if (filters.search && !matchesSearch(issue, filters.search)) {
      return false
    }
    return true
  })
}

/**
 * Задача заблокирована, если её держит незакрытая связь `blocks`.
 * Статуса `blocked` в базе нет — он выводится из графа, поэтому доска
 * считает его сама, а не ждёт от `bd`.
 */
export function isBlocked(
  issue: Issue,
  byId: ReadonlyMap<string, Issue>
): boolean {
  return issue.dependencies.some((dependency) => {
    if (dependency.type !== 'blocks') {
      return false
    }
    if (dependency.issue_id !== issue.id) {
      return false
    }
    return byId.get(dependency.depends_on_id)?.status !== 'closed'
  })
}

export function indexById(issues: readonly Issue[]): Map<string, Issue> {
  return new Map(issues.map((issue) => [issue.id, issue]))
}

/**
 * Задача в том виде, в каком её ждёт экран. Оба добавленных поля выводятся
 * из целого набора, поэтому считаются здесь, до отбора: после отбора
 * ни блокирующей задачи, ни родителя в наборе может уже не быть.
 */
export function toView(
  issue: Issue,
  byId: ReadonlyMap<string, Issue>
): IssueView {
  return {
    ...issue,
    blocked: isBlocked(issue, byId),
    parent_title: issue.parent ? byId.get(issue.parent)?.title : undefined
  }
}
