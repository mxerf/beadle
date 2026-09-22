import {
  type IssueView,
  issueStatusSchema,
  issueTypeSchema
} from '@beadle/protocol'

import {
  PRIORITIES,
  priorityCaption,
  statusCaption,
  typeCaption
} from './captions.ts'
import { byImportance } from './ordering.ts'

/**
 * Разбиение списка на группы. Плоский список из четырёх сотен задач читается
 * как поток; сгруппированный отвечает на вопрос «чего здесь много» до того,
 * как человек начнёт вчитываться в строки.
 */

export const GROUPINGS = ['status', 'priority', 'type', 'epic'] as const

export type Grouping = (typeof GROUPINGS)[number]

/** Подписи в дательном падеже: они дочитывают фразу «Группировать по…». */
export const groupingCaption: Record<Grouping, string> = {
  status: 'статусу',
  priority: 'приоритету',
  type: 'типу',
  epic: 'эпику'
}

export type IssueGroup = {
  /** Значение измерения: по нему группа находит своё место в порядке. */
  key: string
  caption: string
  /** Номер эпика — у такой группы заголовок ведёт на страницу задачи. */
  issueId?: string | undefined
  issues: IssueView[]
}

/**
 * Группировка из адреса. Непонятое значение разворачивает список плоским,
 * а не отказом: в отличие от фильтра, оно не меняет состав показанного —
 * соврать о том, что человек видит, оно не может.
 */
export function toGrouping(raw: string | undefined): Grouping | undefined {
  return GROUPINGS.find((grouping) => grouping === raw)
}

/** Порядок групп — порядок самого измерения, а не алфавит подписей. */
const DIMENSION: Record<Exclude<Grouping, 'epic'>, readonly string[]> = {
  status: issueStatusSchema.options,
  priority: PRIORITIES.map(String),
  type: issueTypeSchema.options
}

/**
 * Чем группа названа и по какому значению собрана. Таблицей, а не разбором
 * по случаям: `Record` по измерениям требует запись на каждое, и новое
 * измерение в `GROUPINGS` перестанет собираться, пока его не опишут здесь.
 */
const HEAD: Record<Grouping, (issue: IssueView) => Omit<IssueGroup, 'issues'>> =
  {
    status: (issue) => ({
      key: issue.status,
      caption: statusCaption[issue.status]
    }),
    priority: (issue) => ({
      key: String(issue.priority),
      caption: priorityCaption(issue.priority)
    }),
    type: (issue) => ({
      key: issue.issue_type,
      caption: typeCaption[issue.issue_type]
    }),
    // Заголовок родителя привозит сервер: под фильтром сам эпик в выборку
    // мог не попасть, и тогда назвать группу больше нечем, кроме номера.
    epic: (issue) =>
      issue.parent
        ? {
            key: issue.parent,
            caption: issue.parent_title ?? issue.parent,
            issueId: issue.parent
          }
        : { key: '', caption: 'Без эпика' }
  }

function byDimension(order: readonly string[]) {
  return (a: IssueGroup, b: IssueGroup): number =>
    order.indexOf(a.key) - order.indexOf(b.key)
}

/**
 * Эпики выстраиваются по самой важной задаче внутри: список обещает срочное
 * сверху, и группировка не должна прятать P0 под алфавитом чужих названий.
 */
function byLeader(a: IssueGroup, b: IssueGroup): number {
  const first = a.issues[0]
  const second = b.issues[0]
  return first && second ? byImportance(first, second) : 0
}

export function groupIssues(
  issues: readonly IssueView[],
  grouping: Grouping
): IssueGroup[] {
  const buckets = new Map<string, IssueGroup>()

  for (const issue of issues) {
    const head = HEAD[grouping](issue)
    const bucket = buckets.get(head.key)
    if (bucket) {
      bucket.issues.push(issue)
    } else {
      buckets.set(head.key, { ...head, issues: [issue] })
    }
  }

  const groups = [...buckets.values()].map((group) => ({
    ...group,
    issues: group.issues.toSorted(byImportance)
  }))

  return grouping === 'epic'
    ? groups.toSorted(byLeader)
    : groups.toSorted(byDimension(DIMENSION[grouping]))
}
