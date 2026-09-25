import { priorityCaption, priorityTone, typeCaption } from './captions.ts'
import { CopyId } from './copy-id.tsx'
import { IssueRoute } from './issue-link.tsx'
import * as styles from './issue-tree.css.ts'
import { byImportance } from './ordering.ts'
import { StatusTag } from './status-tag.tsx'
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
    <div className={styles.head}>
      <IssueRoute id={node.issue.id} className={styles.rowLink}>
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
        <StatusTag status={node.issue.status} />
      </IssueRoute>
      <CopyId id={node.issue.id} />
    </div>
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
            <div className={styles.branch}>
              <IssueRoute id={node.issue.id} className={styles.rowLink}>
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
                {node.issue.blocked_by.length > 0 ? (
                  <span className={tag.tone.danger}>заблокирована</span>
                ) : null}
                <StatusTag status={node.issue.status} />
              </IssueRoute>
              <CopyId id={node.issue.id} />
            </div>
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
