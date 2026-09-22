import { createFileRoute } from '@tanstack/react-router'

import { IssueBoard } from '../issue-board.tsx'
import { IssuesPane } from '../issues-pane.tsx'

/** Доска — тот же отбор по колонкам статусов. */
export const Route = createFileRoute('/w/$slug/board')({ component: BoardView })

function BoardView() {
  return <IssuesPane>{(issues) => <IssueBoard issues={issues} />}</IssuesPane>
}
