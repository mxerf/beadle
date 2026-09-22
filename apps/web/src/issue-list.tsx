import type { IssueView } from '@beadle/protocol'

import { priorityCaption, statusCaption, typeCaption } from './captions.ts'
import * as styles from './issue-list.css.ts'

/**
 * Список задач. `bd` отдаёт их в своём порядке, а человеку нужен верх списка:
 * сначала приоритет, потом свежесть — так самое срочное видно без прокрутки.
 */
export function IssueList({ issues }: { issues: readonly IssueView[] }) {
  const ordered = issues.toSorted(
    (a, b) =>
      a.priority - b.priority || b.updated_at.localeCompare(a.updated_at)
  )

  return (
    <div className={styles.list}>
      {ordered.map((issue) => (
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </div>
  )
}

function IssueRow({ issue }: { issue: IssueView }) {
  return (
    <div className={styles.row}>
      <span className={styles.priority[priorityTone(issue.priority)]}>
        {priorityCaption(issue.priority)}
      </span>
      <span className={styles.type}>{typeCaption[issue.issue_type]}</span>
      <span
        className={
          issue.status === 'closed'
            ? `${styles.title} ${styles.closed}`
            : styles.title
        }
        title={issue.title}
      >
        {issue.title}
      </span>
      <span className={styles.assignee}>{issue.assignee ?? ''}</span>
      <span>
        {issue.blocked ? (
          <span className={styles.blocked}>заблокирована</span>
        ) : null}
      </span>
      <span className={styles.status[issue.status]}>
        {statusCaption[issue.status]}
      </span>
      <span className={styles.id}>{issue.id}</span>
    </div>
  )
}

function priorityTone(priority: number): 'hot' | 'warm' | 'cold' {
  if (priority === 0) {
    return 'hot'
  }
  return priority === 1 ? 'warm' : 'cold'
}
