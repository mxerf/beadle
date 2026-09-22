import { statusCaption, statusTone, typeCaption } from './captions.ts'
import { CopyId } from './copy-id.tsx'
import type { GraphComponent, GraphNode } from './graph.ts'
import * as styles from './issue-graph.css.ts'
import { IssueRoute } from './issue-link.tsx'
import * as tag from './tag.css.ts'

type Props = {
  components: readonly GraphComponent[]
  /** Задачи, попавшие под отбор: остальные показаны как путь к ним. */
  matched: ReadonlySet<string>
}

/**
 * Связки задач по блокировкам: слева то, что ничего не ждёт, дальше — то,
 * что откроется следом. Стрелок нет намеренно: положение в ряду говорит
 * о порядке, а кого именно ждёт задача, написано в подсказке карточки —
 * связок на живом проекте десятки, и паутина линий читается хуже колонок.
 */
export function IssueGraph({ components, matched }: Props) {
  return (
    <div className={styles.graph}>
      {components.map((component) => (
        <section key={component.key} className={styles.component}>
          {component.layers.map((row, index) => (
            <div key={row[0]?.issue.id ?? index} className={styles.step}>
              <span className={styles.stepName}>шаг {index + 1}</span>
              {row.map((node) => (
                <Card key={node.issue.id} node={node} matched={matched} />
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

function Card({
  node,
  matched
}: {
  node: GraphNode
  matched: Props['matched']
}) {
  const { issue } = node

  return (
    <div className={styles.card}>
      <IssueRoute
        id={issue.id}
        className={styles.cardLink}
        title={
          node.blockedBy.length > 0
            ? `Ждёт: ${node.blockedBy.join(', ')}`
            : 'Ничего не ждёт'
        }
      >
        <div className={styles.tags}>
          <span className={tag.tone[statusTone[issue.status]]}>
            {statusCaption[issue.status]}
          </span>
          <span className={tag.tone.quiet}>
            {typeCaption[issue.issue_type]}
          </span>
        </div>
        <div
          className={
            matched.has(issue.id)
              ? styles.title
              : `${styles.title} ${styles.context}`
          }
        >
          {issue.title}
        </div>
      </IssueRoute>
      <div className={styles.foot}>
        <CopyId id={issue.id} />
      </div>
    </div>
  )
}
