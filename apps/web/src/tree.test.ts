import type { IssueStatus, IssueView } from '@beadle/protocol'
import { describe, expect, it } from 'vitest'

import { buildTree, progressByIssue, pruneTree } from './tree.ts'

function issue(
  id: string,
  parent?: string,
  status: IssueStatus = 'open'
): IssueView {
  return {
    id,
    title: id,
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
    blocked_by: [],
    ...(parent === undefined ? {} : { parent })
  }
}

describe('buildTree', () => {
  it('складывает детей под родителя', () => {
    const tree = buildTree([issue('a'), issue('b', 'a'), issue('c', 'b')])

    expect(tree).toHaveLength(1)
    expect(tree[0]?.issue.id).toBe('a')
    expect(tree[0]?.children[0]?.issue.id).toBe('b')
    expect(tree[0]?.children[0]?.children[0]?.issue.id).toBe('c')
  })

  it('задача с родителем вне выборки становится корнем, а не теряется', () => {
    const tree = buildTree([issue('b', 'нет-такого')])

    expect(tree.map((node) => node.issue.id)).toEqual(['b'])
  })

  it('переживает задачу, назначенную родителем самой себе', () => {
    expect(buildTree([issue('a', 'a')])).toEqual([])
  })
})

describe('progressByIssue', () => {
  it('считает потомков и закрытых среди них, не считая сам узел', () => {
    const progress = progressByIssue(
      buildTree([
        issue('epic', undefined, 'closed'),
        issue('a', 'epic', 'closed'),
        issue('b', 'epic'),
        issue('c', 'b', 'closed')
      ])
    )

    expect(progress.get('epic')).toEqual({ total: 3, closed: 2 })
  })

  it('считает и вложенные узлы, а не только корни', () => {
    const progress = progressByIssue(
      buildTree([issue('epic'), issue('b', 'epic'), issue('c', 'b', 'closed')])
    )

    expect(progress.get('b')).toEqual({ total: 1, closed: 1 })
  })

  it('у листа под ним пусто', () => {
    const progress = progressByIssue(buildTree([issue('one')]))

    expect(progress.get('one')).toEqual({ total: 0, closed: 0 })
  })

  it('прогресс не зависит от того, что отобрано: дерево считается целиком', () => {
    const tree = buildTree([
      issue('epic'),
      issue('a', 'epic', 'closed'),
      issue('b', 'epic')
    ])
    const beforePrune = progressByIssue(tree)
    const afterPrune = progressByIssue(
      pruneTree(tree, (candidate) => candidate.id === 'b')
    )

    expect(beforePrune.get('epic')).toEqual({ total: 2, closed: 1 })
    expect(afterPrune.get('epic')).toEqual({ total: 1, closed: 0 })
  })
})

describe('pruneTree', () => {
  const tree = buildTree([
    issue('epic'),
    issue('a', 'epic'),
    issue('b', 'epic'),
    issue('other')
  ])

  it('оставляет родителя ради подошедшего ребёнка', () => {
    const kept = pruneTree(tree, (candidate) => candidate.id === 'b')

    expect(kept).toHaveLength(1)
    expect(kept[0]?.issue.id).toBe('epic')
    expect(kept[0]?.children.map((node) => node.issue.id)).toEqual(['b'])
  })

  it('убирает ветку, где не подошёл никто', () => {
    expect(pruneTree(tree, (candidate) => candidate.id === 'нет')).toEqual([])
  })

  it('оставляет подошедший лист без детей', () => {
    const kept = pruneTree(tree, (candidate) => candidate.id === 'other')

    expect(kept.map((node) => node.issue.id)).toEqual(['other'])
  })
})
