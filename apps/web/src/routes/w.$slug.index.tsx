import { createFileRoute } from '@tanstack/react-router'

import { IssueList } from '../issue-list.tsx'
import { IssuesPane } from '../issues-pane.tsx'

/** Список — вид по умолчанию: подробности строкой, всё на одном экране. */
export const Route = createFileRoute('/w/$slug/')({ component: ListView })

function ListView() {
  return <IssuesPane>{(issues) => <IssueList issues={issues} />}</IssuesPane>
}
