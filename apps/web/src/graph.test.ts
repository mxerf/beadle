import type { IssueView } from '@beadle/protocol'
import { describe, expect, it } from 'vitest'

import { buildGraph, pruneGraph } from './graph.ts'

/** `waits` — кого задача ждёт: ребро `blocks` лежит у зависимой стороны. */
function issue(
  id: string,
  waits: readonly string[] = [],
  priority = 2
): IssueView {
  return {
    id,
    title: `задача ${id}`,
    status: 'open',
    issue_type: 'task',
    priority,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    labels: [],
    dependencies: waits.map((holder) => ({
      issue_id: id,
      depends_on_id: holder,
      type: 'blocks' as const,
      created_at: '2026-01-01',
      created_by: 'тест'
    })),
    dependency_count: waits.length,
    dependent_count: 0,
    comment_count: 0,
    blocked_by: []
  }
}

function shape(components: ReturnType<typeof buildGraph>) {
  return components.map((component) =>
    component.layers.map((row) => row.map((node) => node.issue.id))
  )
}

describe('buildGraph', () => {
  it('выстраивает цепочку по слоям', () => {
    const graph = buildGraph([issue('a'), issue('b', ['a']), issue('c', ['b'])])

    expect(shape(graph)).toEqual([[['a'], ['b'], ['c']]])
  })

  it('независимые задачи стоят в одном слое', () => {
    const graph = buildGraph([issue('a'), issue('b'), issue('c', ['a', 'b'])])

    expect(shape(graph)).toEqual([[['a', 'b'], ['c']]])
  })

  it('задача ждёт самого позднего из держателей, а не первого', () => {
    // c ждёт a и b, но b сама ждёт a — значит c идёт третьим шагом.
    const graph = buildGraph([
      issue('a'),
      issue('b', ['a']),
      issue('c', ['a', 'b'])
    ])

    expect(shape(graph)).toEqual([[['a'], ['b'], ['c']]])
  })

  it('связки не смешиваются', () => {
    const graph = buildGraph([
      issue('a'),
      issue('b', ['a']),
      issue('x'),
      issue('y', ['x'])
    ])

    expect(graph).toHaveLength(2)
    expect(graph.map((component) => component.key).toSorted()).toEqual([
      'a',
      'x'
    ])
  })

  it('ребро в задачу вне набора не рисуется', () => {
    const graph = buildGraph([issue('b', ['нет-такой'])])

    expect(graph).toEqual([])
  })

  it('не берёт задачи, между которыми нет блокировок', () => {
    expect(buildGraph([issue('a'), issue('b')])).toEqual([])
  })

  it('петля не вешает разбор', () => {
    const graph = buildGraph([issue('a', ['b']), issue('b', ['a'])])

    expect(graph).toHaveLength(1)
    expect(graph[0]?.layers.flat()).toHaveLength(2)
  })

  it('впереди связка с самой срочной начинающей задачей', () => {
    const graph = buildGraph([
      issue('a', [], 3),
      issue('b', ['a'], 3),
      issue('x', [], 0),
      issue('y', ['x'], 3)
    ])

    expect(graph[0]?.key).toBe('x')
  })

  it('называет держателей в пределах набора', () => {
    const graph = buildGraph([issue('a'), issue('b', ['a'])])

    expect(graph[0]?.layers[1]?.[0]?.blockedBy).toEqual(['a'])
  })
})

describe('pruneGraph', () => {
  it('выбрасывает связку, в которой ничего не подошло', () => {
    const graph = buildGraph([
      issue('a'),
      issue('b', ['a']),
      issue('x'),
      issue('y', ['x'])
    ])

    const left = pruneGraph(graph, new Set(['b']))

    expect(left).toHaveLength(1)
    expect(left[0]?.key).toBe('a')
  })

  it('внутри связки задачи не выбрасывает: они и есть путь', () => {
    const graph = buildGraph([issue('a'), issue('b', ['a'])])

    expect(pruneGraph(graph, new Set(['b']))[0]?.layers.flat()).toHaveLength(2)
  })
})
