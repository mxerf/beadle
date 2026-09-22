import type { IssueView } from '@beadle/protocol'

import { byImportance } from './ordering.ts'

/**
 * Порядок работ по рёбрам `blocks`. Ни один другой вид на это не отвечает:
 * список знает важность, доска — состояние, эпики — принадлежность, и только
 * граф говорит, что за чем идёт и с чего можно начинать.
 */

export type GraphNode = {
  issue: IssueView
  /** Кого эта задача ждёт — в пределах набора. */
  blockedBy: string[]
}

export type GraphComponent = {
  /** Наименьший номер в связке: не зависит от порядка обхода. */
  key: string
  /** Слои по порядку. Внутри слоя задачи друг друга не ждут. */
  layers: GraphNode[][]
}

/** Разделитель в ключе ребра: в номерах задач такого символа не бывает. */
const EDGE = '\u0000'

export function buildGraph(issues: readonly IssueView[]): GraphComponent[] {
  const byId = new Map(issues.map((issue) => [issue.id, issue]))
  const edges = new Set<string>()

  // Ребро берётся с любой стороны: `bd` кладёт его в связи обеим задачам,
  // а набор отбрасывает второй экземпляр. Концы вне выборки отбрасываются
  // тоже — рисовать стрелку в никуда хуже, чем не рисовать.
  for (const issue of issues) {
    for (const dependency of issue.dependencies) {
      if (dependency.type !== 'blocks') {
        continue
      }
      if (dependency.issue_id === dependency.depends_on_id) {
        continue
      }
      if (byId.has(dependency.issue_id) && byId.has(dependency.depends_on_id)) {
        edges.add(`${dependency.depends_on_id}${EDGE}${dependency.issue_id}`)
      }
    }
  }

  const holders = new Map<string, string[]>()
  const dependents = new Map<string, string[]>()

  for (const edge of edges) {
    const [holder, dependent] = edge.split(EDGE)
    if (holder === undefined || dependent === undefined) {
      continue
    }
    holders.set(dependent, [...(holders.get(dependent) ?? []), holder])
    dependents.set(holder, [...(dependents.get(holder) ?? []), dependent])
  }

  const seen = new Set<string>()
  const components: GraphComponent[] = []

  for (const id of [...holders.keys(), ...dependents.keys()]) {
    if (seen.has(id)) {
      continue
    }
    components.push(
      toComponent(collect(id, holders, dependents, seen), holders, byId)
    )
  }

  // Впереди связка, начать которую можно с самого срочного: нулевой слой
  // отсортирован, поэтому достаточно посмотреть на его первую задачу.
  return components.toSorted((a, b) => {
    const first = a.layers[0]?.[0]?.issue
    const second = b.layers[0]?.[0]?.issue
    return first && second ? byImportance(first, second) : 0
  })
}

/** Все задачи одной связки: по рёбрам в обе стороны, без оглядки на направление. */
function collect(
  start: string,
  holders: ReadonlyMap<string, string[]>,
  dependents: ReadonlyMap<string, string[]>,
  seen: Set<string>
): string[] {
  const group: string[] = []
  const queue = [start]

  while (queue.length > 0) {
    const current = queue.pop()
    if (current === undefined || seen.has(current)) {
      continue
    }
    seen.add(current)
    group.push(current)
    queue.push(
      ...(holders.get(current) ?? []),
      ...(dependents.get(current) ?? [])
    )
  }

  return group
}

function toComponent(
  group: readonly string[],
  holders: ReadonlyMap<string, string[]>,
  byId: ReadonlyMap<string, IssueView>
): GraphComponent {
  const depth = new Map<string, number>()
  const layers: GraphNode[][] = []

  // По номеру, а не в порядке обхода: сортировка по важности устойчива,
  // и при равной важности порядок в слое иначе зависел бы от того, с какой
  // задачи начался обход связки.
  for (const id of group.toSorted()) {
    const issue = byId.get(id)
    if (!issue) {
      continue
    }
    const layer = layerOf(id, holders, depth, new Set())
    const node = { issue, blockedBy: (holders.get(id) ?? []).toSorted() }
    const row = layers[layer]
    if (row) {
      row.push(node)
    } else {
      layers[layer] = [node]
    }
  }

  return {
    key: group.toSorted()[0] ?? '',
    layers: layers.map((row) =>
      row.toSorted((a, b) => byImportance(a.issue, b.issue))
    )
  }
}

/**
 * Слой — длиннейший путь от начала: задача не начнётся раньше самого позднего
 * из своих держателей. Петля обрывается нулём. В данных её быть не должно,
 * но `bd` не мешает её завести, а рекурсия без защиты уронит страницу —
 * читалка обязана пережить кривые данные чужого трекера.
 */
function layerOf(
  id: string,
  holders: ReadonlyMap<string, string[]>,
  depth: Map<string, number>,
  path: Set<string>
): number {
  const known = depth.get(id)
  if (known !== undefined) {
    return known
  }
  if (path.has(id)) {
    return 0
  }

  path.add(id)
  const mine = holders.get(id) ?? []
  const layer =
    mine.length === 0
      ? 0
      : 1 +
        Math.max(...mine.map((holder) => layerOf(holder, holders, depth, path)))
  path.delete(id)

  depth.set(id, layer)
  return layer
}

/**
 * Связки, в которых под отбор не попало ничего, убираются целиком. Отдельные
 * задачи не выбрасываются: они и есть путь, ради которого сюда пришли.
 */
export function pruneGraph(
  components: readonly GraphComponent[],
  matched: ReadonlySet<string>
): GraphComponent[] {
  return components.filter((component) =>
    component.layers.some((row) =>
      row.some((node) => matched.has(node.issue.id))
    )
  )
}
