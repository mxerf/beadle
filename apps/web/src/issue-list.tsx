import type { IssueView } from '@beadle/protocol'

import {
  priorityCaption,
  priorityTone,
  statusCaption,
  statusTone,
  typeCaption
} from './captions.ts'
import { IssueRoute } from './issue-link.tsx'
import * as styles from './issue-list.css.ts'
import { byImportance } from './ordering.ts'
import * as tag from './tag.css.ts'

/** Список задач: самое срочное сверху, остальное — вниз по важности. */
export function IssueList({ issues }: { issues: readonly IssueView[] }) {
  return (
    <div className={styles.list}>
      {issues.toSorted(byImportance).map((issue) => (
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </div>
  )
}

function IssueRow({ issue }: { issue: IssueView }) {
  return (
    <IssueRoute id={issue.id} className={styles.row}>
      <span className={tag.tone[priorityTone(issue.priority)]}>
        {priorityCaption(issue.priority)}
      </span>
      <span className={tag.tone.quiet}>{typeCaption[issue.issue_type]}</span>
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
          <span className={tag.tone.danger}>заблокирована</span>
        ) : null}
      </span>
      <span className={tag.tone[statusTone[issue.status]]}>
        {statusCaption[issue.status]}
      </span>
      <span className={styles.id}>{issue.id}</span>
    </IssueRoute>
  )
}
