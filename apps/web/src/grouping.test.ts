import type { IssueView } from '@beadle/protocol'
import { describe, expect, it } from 'vitest'

import { groupIssues, toGrouping } from './grouping.ts'

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
    blocked: false,
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
      'status'
    )

    expect(groups.map((group) => group.key)).toEqual([
      'open',
      'in_progress',
      'closed'
    ])
  })

  it('пустых групп не заводит', () => {
    const groups = groupIssues([issue('a')], 'status')

    expect(groups).toHaveLength(1)
    expect(groups[0]?.caption).toBe('открыта')
  })

  it('внутри группы держит срочное сверху', () => {
    const groups = groupIssues(
      [issue('a', { priority: 3 }), issue('b', { priority: 0 })],
      'type'
    )

    expect(groups[0]?.issues.map((one) => one.id)).toEqual(['b', 'a'])
  })

  it('называет группу эпика его заголовком, а не номером', () => {
    const groups = groupIssues(
      [issue('a', { parent: 'e1', parent_title: 'Доска и эпики' })],
      'epic'
    )

    expect(groups[0]?.caption).toBe('Доска и эпики')
    expect(groups[0]?.issueId).toBe('e1')
  })

  it('без заголовка родителя показывает номер, а не пустоту', () => {
    const groups = groupIssues([issue('a', { parent: 'e1' })], 'epic')

    expect(groups[0]?.caption).toBe('e1')
  })

  it('задачи без эпика собирает отдельной группой без ссылки', () => {
    const groups = groupIssues([issue('a')], 'epic')

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
      'epic'
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
