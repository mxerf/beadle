import {
  priorityCaption,
  priorityTone,
  statusCaption,
  statusTone,
  typeCaption
} from './captions.ts'
import { IssueRoute } from './issue-link.tsx'
import * as styles from './issue-tree.css.ts'
import { byImportance } from './ordering.ts'
import * as tag from './tag.css.ts'
import type { IssueNode, Progress } from './tree.ts'

type Props = {
  nodes: readonly IssueNode[]
  /** Задачи, попавшие под фильтр: остальные показаны как путь к ним. */
  matched: ReadonlySet<string>
  /** Готовый прогресс по всему дереву: отбор на него не влияет. */
  progress: ReadonlyMap<string, Progress>
}

/** Эпики и всё, что под ними: структура проекта, а не плоский список. */
export function IssueTree({ nodes, matched, progress }: Props) {
  return (
    <div className={styles.tree}>
      {nodes.map((node) => (
        <section key={node.issue.id} className={styles.group}>
          <GroupHead node={node} matched={matched} progress={progress} />
          <Children
            nodes={node.children}
            matched={matched}
            progress={progress}
          />
        </section>
      ))}
    </div>
  )
}

function GroupHead({
  node,
  matched,
  progress
}: {
  node: IssueNode
  matched: Props['matched']
  progress: Props['progress']
}) {
  const { total, closed } = progress.get(node.issue.id) ?? {
    total: 0,
    closed: 0
  }
  const done = total > 0 ? Math.round((closed / total) * 100) : 0

  return (
    <IssueRoute id={node.issue.id} className={styles.head}>
      <span className={tag.tone.quiet}>
        {typeCaption[node.issue.issue_type]}
      </span>
      <span
        className={
          matched.has(node.issue.id)
            ? styles.heading
            : `${styles.heading} ${styles.context}`
        }
        title={node.issue.title}
      >
        {node.issue.title}
      </span>
      <span className={styles.progress}>
        закрыто {closed} из {total}
      </span>
      <span className={styles.bar}>
        <span className={styles.barFill} style={{ width: `${done}%` }} />
      </span>
      <span className={tag.tone[statusTone[node.issue.status]]}>
        {statusCaption[node.issue.status]}
      </span>
      <span className={styles.id}>{node.issue.id}</span>
    </IssueRoute>
  )
}

function Children({ nodes, matched, progress }: Props) {
  if (nodes.length === 0) {
    return null
  }

  return (
    <div>
      {nodes
        .toSorted((a, b) => byImportance(a.issue, b.issue))
        .map((node) => (
          <div key={node.issue.id}>
            <IssueRoute id={node.issue.id} className={styles.branch}>
              <span className={tag.tone[priorityTone(node.issue.priority)]}>
                {priorityCaption(node.issue.priority)}
              </span>
              <span
                className={
                  matched.has(node.issue.id)
                    ? styles.title
                    : `${styles.title} ${styles.context}`
                }
                title={node.issue.title}
              >
                {node.issue.title}
              </span>
              {node.issue.blocked ? (
                <span className={tag.tone.danger}>заблокирована</span>
              ) : null}
              <span className={tag.tone[statusTone[node.issue.status]]}>
                {statusCaption[node.issue.status]}
              </span>
              <span className={styles.id}>{node.issue.id}</span>
            </IssueRoute>
            {node.children.length > 0 ? (
              <div className={styles.nested}>
                <Children
                  nodes={node.children}
                  matched={matched}
                  progress={progress}
                />
              </div>
            ) : null}
          </div>
        ))}
    </div>
  )
}
