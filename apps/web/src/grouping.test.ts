import type { IssueView } from '@beadle/protocol'
import { describe, expect, it } from 'vitest'

import { groupIssues, toGrouping } from './grouping.ts'

/** Порядок статусов проекта со своими этапами между работой и закрытием. */
const STATUSES = [
  'open',
  'in_progress',
  'awaiting_staging',
  'awaiting_prod',
  'deferred',
  'closed'
]

function issue(id: string, extra: Partial<IssueView> = {}): IssueView {
  return {
    id,
    title: `задача ${id}`,
    status: 'open',
    issue_type: 'task',
    priority: 2,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    labels: [],
    dependencies: [],
    dependency_count: 0,
    dependent_count: 0,
    comment_count: 0,
    blocked_by: [],
    ...extra
  }
}

describe('toGrouping', () => {
  it('узнаёт известное измерение', () => {
    expect(toGrouping('epic')).toBe('epic')
  })

  it('непонятое значение разворачивает список плоским', () => {
    expect(toGrouping('по-цвету')).toBeUndefined()
    expect(toGrouping(undefined)).toBeUndefined()
  })
})

describe('groupIssues', () => {
  it('ставит группы в порядке измерения, а не в порядке встречи', () => {
    const groups = groupIssues(
      [
        issue('a', { status: 'closed' }),
        issue('b', { status: 'open' }),
        issue('c', { status: 'in_progress' })
      ],
      'status',
      STATUSES
    )

    expect(groups.map((group) => group.key)).toEqual([
      'open',
      'in_progress',
      'closed'
    ])
  })

  it('ставит свои статусы проекта на их место в пути задачи', () => {
    const groups = groupIssues(
      [
        issue('a', { status: 'closed' }),
        issue('b', { status: 'awaiting_prod' }),
        issue('c', { status: 'awaiting_staging' }),
        issue('d', { status: 'open' })
      ],
      'status',
      STATUSES
    )

    expect(groups.map((group) => group.key)).toEqual([
      'open',
      'awaiting_staging',
      'awaiting_prod',
      'closed'
    ])
  })

  it('статус не из словаря уводит в конец, а не в начало', () => {
    const groups = groupIssues(
      [issue('a', { status: 'забытый' }), issue('b', { status: 'open' })],
      'status',
      STATUSES
    )

    expect(groups.map((group) => group.key)).toEqual(['open', 'забытый'])
  })

  it('пустых групп не заводит', () => {
    const groups = groupIssues([issue('a')], 'status', STATUSES)

    expect(groups).toHaveLength(1)
    expect(groups[0]?.caption).toBe('открыта')
  })

  it('внутри группы держит срочное сверху', () => {
    const groups = groupIssues(
      [issue('a', { priority: 3 }), issue('b', { priority: 0 })],
      'type',
      STATUSES
    )

    expect(groups[0]?.issues.map((one) => one.id)).toEqual(['b', 'a'])
  })

  it('называет группу эпика его заголовком, а не номером', () => {
    const groups = groupIssues(
      [issue('a', { parent: 'e1', parent_title: 'Доска и эпики' })],
      'epic',
      STATUSES
    )

    expect(groups[0]?.caption).toBe('Доска и эпики')
    expect(groups[0]?.issueId).toBe('e1')
  })

  it('без заголовка родителя показывает номер, а не пустоту', () => {
    const groups = groupIssues([issue('a', { parent: 'e1' })], 'epic', STATUSES)

    expect(groups[0]?.caption).toBe('e1')
  })

  it('задачи без эпика собирает отдельной группой без ссылки', () => {
    const groups = groupIssues([issue('a')], 'epic', STATUSES)

    expect(groups[0]?.caption).toBe('Без эпика')
    expect(groups[0]?.issueId).toBeUndefined()
  })

  it('эпики выстраивает по самой важной задаче внутри', () => {
    const groups = groupIssues(
      [
        issue('a', { parent: 'e1', parent_title: 'спокойный', priority: 3 }),
        issue('b', { parent: 'e2', parent_title: 'горящий', priority: 0 }),
        issue('c', { priority: 1 })
      ],
      'epic',
      STATUSES
    )

    // «Без эпика» — такая же группа, а не хвост списка: срочная задача,
    // которую забыли привязать, не должна из-за этого уехать вниз.
    expect(groups.map((group) => group.caption)).toEqual([
      'горящий',
      'Без эпика',
      'спокойный'
    ])
  })
})
