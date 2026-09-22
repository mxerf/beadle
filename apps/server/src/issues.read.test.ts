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

describe('applyFilters', () => {
  it('«готово к работе» — открытая и свободная, а не просто открытая', () => {
    const holder = issue('t3')
    const issues = [
      issue('t1'),
      issue('t2', { status: 'in_progress' }),
      issue('t4', { status: 'deferred' }),
      holder,
      issue('t5', { dependencies: [blocks('t5', 't3')] })
    ]
    const byId = indexById(issues)
    const views = issues.map((one) => toView(one, byId))

    expect(applyFilters(views, { ready: true }).map((one) => one.id)).toEqual([
      't1',
      't3'
    ])
  })

  it('выключенный флаг ничего не отбирает', () => {
    const issues = [issue('t1'), issue('t2', { status: 'closed' })]
    const byId = indexById(issues)
    const views = issues.map((one) => toView(one, byId))

    expect(applyFilters(views, { ready: false })).toHaveLength(2)
  })
})

describe('toView', () => {
  it('берёт заголовок родителя, даже если родитель не прошёл отбор', () => {
    const epic = issue('e1', { title: 'Доска и эпики', issue_type: 'epic' })
    const child = issue('t1', { parent: 'e1', status: 'in_progress' })
    const byId = indexById([epic, child])

    // Ровно та развилка, ради которой поле считается на сервере: под фильтром
    // по статусу эпик из выборки выпал, а заголовок группы всё равно нужен.
    const views = [epic, child].map((one) => toView(one, byId))
    const filtered = applyFilters(views, { status: ['in_progress'] })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.parent_title).toBe('Доска и эпики')
  })

  it('оставляет поле пустым, если родителя нет в проекте', () => {
    const orphan = issue('t1', { parent: 'нет-такого' })

    expect(toView(orphan, indexById([orphan])).parent_title).toBeUndefined()
  })

  it('называет держателя, пока тот не закрыт', () => {
    const holder = issue('t2')
    const held = issue('t1', { dependencies: [blocks('t1', 't2')] })

    expect(toView(held, indexById([held, holder])).blocked_by).toEqual(['t2'])
    expect(
      toView(held, indexById([held, issue('t2', { status: 'closed' })]))
        .blocked_by
    ).toEqual([])
  })
})
