import type { IssueView } from '@beadle/protocol'

import {
  plural,
  priorityCaption,
  priorityTone,
  typeCaption
} from './captions.ts'
import { CopyId } from './copy-id.tsx'
import { type Grouping, groupIssues, type IssueGroup } from './grouping.ts'
import { IssueRoute } from './issue-link.tsx'
import * as styles from './issue-list.css.ts'
import { byImportance } from './ordering.ts'
import { StatusTag } from './status-tag.tsx'
import { statusOrder, useStatuses } from './statuses.ts'
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
  const statuses = useStatuses()

  if (!grouping) {
    return (
      <div className={styles.list}>
        <Rows issues={issues.toSorted(byImportance)} />
      </div>
    )
  }

  const groups = groupIssues(issues, grouping, statusOrder(statuses, issues))

  return (
    <div className={styles.islands}>
      {groups.map((group) => (
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

/**
 * Кто держит задачу. «Заблокирована» отвечает на вопрос, который человек
 * задаёт вторым: первым он спрашивает «кем» — и без номера всё равно идёт
 * на страницу выяснять. Держателей бывает несколько, но в строке помещается
 * один; остальные — в подсказке.
 */
function Held({ ids }: { ids: readonly string[] }) {
  const first = ids[0]
  if (!first) {
    return null
  }

  return (
    <span className={tag.tone.danger} title={`Держат: ${ids.join(', ')}`}>
      ждёт {first}
      {ids.length > 1 ? ` и ещё ${ids.length - 1}` : ''}
    </span>
  )
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
    <div className={styles.row}>
      <IssueRoute id={issue.id} className={styles.rowLink}>
        <span className={tag.tone[priorityTone(issue.priority)]}>
          {priorityCaption(issue.priority)}
        </span>
        <span className={tag.tone.quiet}>{typeCaption[issue.issue_type]}</span>
        <span className={styles.titleCell}>
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
          {issue.labels.map((label) => (
            <span key={label} className={tag.tone.neutral}>
              {label}
            </span>
          ))}
        </span>
        <span className={styles.assignee}>{issue.assignee ?? ''}</span>
        <span className={styles.flag}>
          <Held ids={issue.blocked_by} />
        </span>
        <StatusTag status={issue.status} />
      </IssueRoute>
      <CopyId id={issue.id} className={styles.idCell} />
    </div>
  )
}
