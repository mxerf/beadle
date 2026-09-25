import type { IssueView, Status } from '@beadle/protocol'

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
import { statusOrder, useStatuses } from './statuses.ts'
import * as tag from './tag.css.ts'

/**
 * Встроенные статусы, колонка которых стоит и пустой. Остальные встроенные
 * почти не встречаются: `hooked` — для агентов Gas Town, `pinned` — для
 * вечных задач, `blocked` ставят руками поверх графа. Пустая колонка под
 * каждый растянула бы доску вдвое, поэтому они появляются, только когда
 * в них что-то есть. Свои статусы проекта показываются всегда: их завели
 * нарочно, и пустая колонка этапа — тоже ответ.
 */
const ALWAYS_SHOWN = new Set(['open', 'in_progress', 'deferred', 'closed'])

function isShown(
  name: string,
  statuses: readonly Status[],
  issues: readonly IssueView[]
): boolean {
  const status = statuses.find((one) => one.name === name)
  return (
    ALWAYS_SHOWN.has(name) ||
    status?.custom === true ||
    issues.some((issue) => issue.status === name)
  )
}

/**
 * Доска: колонки по статусам в том порядке, в каком задача их проходит.
 * Порядок и сами статусы берутся из словаря проекта: свой статус в beads
 * появится колонкой сам.
 */
export function IssueBoard({ issues }: { issues: readonly IssueView[] }) {
  const statuses = useStatuses()
  const columns = statusOrder(statuses, issues).filter((name) =>
    isShown(name, statuses, issues)
  )

  return (
    <div className={styles.board}>
      {columns.map((status) => (
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
  status: string
  issues: readonly IssueView[]
}) {
  return (
    <section className={styles.column}>
      <header className={styles.columnHead}>
        <span className={styles.columnName}>{statusCaption(status)}</span>
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
          {issue.blocked_by.length > 0 ? (
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
