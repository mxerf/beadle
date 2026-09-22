import {
  type IssueStatus,
  issueStatusSchema,
  type IssueView
} from '@beadle/protocol'

import {
  priorityCaption,
  priorityTone,
  statusCaption,
  typeCaption
} from './captions.ts'
import { CopyId } from './copy-id.tsx'
import * as styles from './issue-board.css.ts'
import { IssueRoute } from './issue-link.tsx'
import { byImportance } from './ordering.ts'
import * as tag from './tag.css.ts'

/**
 * Доска: колонки по статусам в том порядке, в каком задача их проходит.
 * Порядок берётся из схемы, а не переписан руками — новый статус в beads
 * появится колонкой сам.
 */
export function IssueBoard({ issues }: { issues: readonly IssueView[] }) {
  return (
    <div className={styles.board}>
      {issueStatusSchema.options.map((status) => (
        <Column
          key={status}
          status={status}
          issues={issues.filter((issue) => issue.status === status)}
        />
      ))}
    </div>
  )
}

function Column({
  status,
  issues
}: {
  status: IssueStatus
  issues: readonly IssueView[]
}) {
  return (
    <section className={styles.column}>
      <header className={styles.columnHead}>
        <span className={styles.columnName}>{statusCaption[status]}</span>
        <span className={styles.columnCount}>{issues.length}</span>
      </header>
      {issues.length === 0 ? (
        <p className={styles.empty}>пусто</p>
      ) : (
        <div className={styles.stack}>
          {issues.toSorted(byImportance).map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </section>
  )
}

function IssueCard({ issue }: { issue: IssueView }) {
  return (
    <div className={styles.card}>
      <IssueRoute id={issue.id} className={styles.cardLink}>
        <div className={styles.cardHead}>
          <span className={tag.tone[priorityTone(issue.priority)]}>
            {priorityCaption(issue.priority)}
          </span>
          <span className={tag.tone.quiet}>
            {typeCaption[issue.issue_type]}
          </span>
          {issue.blocked ? (
            <span className={tag.tone.danger}>заблокирована</span>
          ) : null}
        </div>
        <div className={styles.title} title={issue.title}>
          {issue.title}
        </div>
      </IssueRoute>
      <div className={styles.foot}>
        <CopyId id={issue.id} />
        {issue.assignee ? <span>{issue.assignee}</span> : null}
      </div>
    </div>
  )
}
