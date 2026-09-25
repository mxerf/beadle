import type { IssueView, Status } from '@beadle/protocol'
import { describe, expect, it } from 'vitest'

import { statusOrder } from './statuses.ts'

function issue(id: string, status: string): IssueView {
  return {
    id,
    title: `задача ${id}`,
    status,
    issue_type: 'task',
    priority: 2,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    labels: [],
    dependencies: [],
    dependency_count: 0,
    dependent_count: 0,
    comment_count: 0,
    blocked_by: []
  }
}

const STATUSES: Status[] = [
  { name: 'open', category: 'active', custom: false },
  { name: 'awaiting_prod', category: 'wip', custom: true },
  { name: 'closed', category: 'done', custom: false }
]

describe('statusOrder', () => {
  it('держит порядок словаря, даже если задач в статусе нет', () => {
    expect(statusOrder(STATUSES, [issue('a', 'closed')])).toEqual([
      'open',
      'awaiting_prod',
      'closed'
    ])
  })

  it('не теряет статус, который убрали из словаря, а задачи остались', () => {
    const issues = [issue('a', 'open'), issue('b', 'qa'), issue('c', 'qa')]

    expect(statusOrder(STATUSES, issues)).toEqual([
      'open',
      'awaiting_prod',
      'closed',
      'qa'
    ])
  })
})
