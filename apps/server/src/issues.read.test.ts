import type { Dependency, Issue } from '@beadle/protocol'
import { describe, expect, it } from 'vitest'

import { applyFilters, indexById, toView } from './issues.read.ts'

function issue(id: string, extra: Partial<Issue> = {}): Issue {
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
    ...extra
  }
}

function blocks(id: string, by: string): Dependency {
  return {
    issue_id: id,
    depends_on_id: by,
    type: 'blocks',
    created_at: '2026-01-01',
    created_by: 'тест'
  }
}

describe('toView', () => {
  it('берёт заголовок родителя, даже если родитель не прошёл отбор', () => {
    const epic = issue('e1', { title: 'Доска и эпики', issue_type: 'epic' })
    const child = issue('t1', { parent: 'e1', status: 'in_progress' })
    const byId = indexById([epic, child])

    // Ровно та развилка, ради которой поле считается на сервере: под фильтром
    // по статусу эпик из выборки выпал, а заголовок группы всё равно нужен.
    const filtered = applyFilters([epic, child], { status: ['in_progress'] })

    expect(filtered).toHaveLength(1)
    expect(toView(child, byId).parent_title).toBe('Доска и эпики')
  })

  it('оставляет поле пустым, если родителя нет в проекте', () => {
    const orphan = issue('t1', { parent: 'нет-такого' })

    expect(toView(orphan, indexById([orphan])).parent_title).toBeUndefined()
  })

  it('заблокирована, пока держащая задача не закрыта', () => {
    const holder = issue('t2')
    const held = issue('t1', { dependencies: [blocks('t1', 't2')] })

    expect(toView(held, indexById([held, holder])).blocked).toBe(true)
    expect(
      toView(held, indexById([held, issue('t2', { status: 'closed' })])).blocked
    ).toBe(false)
  })
})
