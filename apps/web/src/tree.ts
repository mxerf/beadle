import type { IssueView } from '@beadle/protocol'

export type IssueNode = {
  issue: IssueView
  children: IssueNode[]
}

/**
 * Дерево задач по полю `parent`. Корень — задача без родителя или с таким,
 * которого нет в выборке: иначе ветка потерялась бы целиком.
 *
 * Обход идёт с защитой от петли. В данных её быть не должно, но `bd` не мешает
 * назначить родителем собственного потомка, а рекурсия без защиты уронит
 * страницу целиком — читалка обязана пережить кривые данные чужого трекера.
 */
export function buildTree(issues: readonly IssueView[]): IssueNode[] {
  const known = new Set(issues.map((issue) => issue.id))
  const byParent = new Map<string, IssueView[]>()
  const roots: IssueView[] = []

  for (const issue of issues) {
    const parent = issue.parent
    if (parent !== undefined && known.has(parent)) {
      byParent.set(parent, [...(byParent.get(parent) ?? []), issue])
    } else {
      roots.push(issue)
    }
  }

  function visit(issue: IssueView, seen: ReadonlySet<string>): IssueNode {
    const passed = new Set(seen).add(issue.id)
    const children = (byParent.get(issue.id) ?? [])
      .filter((child) => !passed.has(child.id))
      .map((child) => visit(child, passed))
    return { issue, children }
  }

  return roots.map((root) => visit(root, new Set()))
}

export type Progress = {
  total: number
  closed: number
}

/**
 * Сколько задач лежит под каждым узлом и сколько из них закрыто. Сам узел
 * не считается: у эпика спрашивают про его содержимое, а не про него самого.
 *
 * Считается по всему дереву и до отбора: «закрыто 13 из 15» — свойство эпика,
 * а не текущего фильтра. Иначе фильтр по открытым превратил бы любой прогресс
 * в «0 из N» и соврал бы о состоянии работы.
 */
export function progressByIssue(
  nodes: readonly IssueNode[]
): Map<string, Progress> {
  const progress = new Map<string, Progress>()

  function visit(node: IssueNode): Progress {
    let total = 0
    let closed = 0

    for (const child of node.children) {
      const under = visit(child)
      total += 1 + under.total
      closed += under.closed + (child.issue.status === 'closed' ? 1 : 0)
    }

    const own = { total, closed }
    progress.set(node.issue.id, own)
    return own
  }

  for (const node of nodes) {
    visit(node)
  }
  return progress
}

/**
 * Оставляет в дереве узлы, которые сами подошли или держат подошедшего
 * потомка. Родитель, не попавший под фильтр, остаётся как путь к детям —
 * без него ветка повисла бы в воздухе.
 */
export function pruneTree(
  nodes: readonly IssueNode[],
  keep: (issue: IssueView) => boolean
): IssueNode[] {
  return nodes.flatMap((node) => {
    const children = pruneTree(node.children, keep)
    if (children.length === 0 && !keep(node.issue)) {
      return []
    }
    return [{ issue: node.issue, children }]
  })
}
