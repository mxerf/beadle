import type { IssueView } from '@beadle/protocol'

import {
  plural,
  priorityCaption,
  priorityTone,
  statusCaption,
  statusTone,
  typeCaption
} from './captions.ts'
import { type Grouping, groupIssues, type IssueGroup } from './grouping.ts'
import { IssueRoute } from './issue-link.tsx'
import * as styles from './issue-list.css.ts'
import { byImportance } from './ordering.ts'
import * as tag from './tag.css.ts'

/**
 * Список задач: самое срочное сверху, остальное — вниз по важности.
 * Группировка разводит список по островкам — так же, как эпики: группа
 * читается как одно целое, и заголовок принадлежит ей, а не пространству
 * над строками.
 */
export function IssueList({
  issues,
  grouping
}: {
  issues: readonly IssueView[]
  grouping?: Grouping | undefined
}) {
  if (!grouping) {
    return (
      <div className={styles.list}>
        <Rows issues={issues.toSorted(byImportance)} />
      </div>
    )
  }

  return (
    <div className={styles.islands}>
      {groupIssues(issues, grouping).map((group) => (
        <section key={group.key} className={styles.list}>
          <GroupHead group={group} />
          <Rows issues={group.issues} />
        </section>
      ))}
    </div>
  )
}

function Rows({ issues }: { issues: readonly IssueView[] }) {
  return issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
}

function GroupHead({ group }: { group: IssueGroup }) {
  const count = group.issues.length

  return (
    <div className={styles.groupHead}>
      {group.issueId ? (
        <IssueRoute id={group.issueId} className={styles.groupLink}>
          {group.caption}
        </IssueRoute>
      ) : (
        <span className={styles.groupCaption}>{group.caption}</span>
      )}
      <span className={styles.groupCount}>
        {count} {plural(count, 'задача', 'задачи', 'задач')}
      </span>
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
