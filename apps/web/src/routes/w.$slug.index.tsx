import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'

import { GroupSwitch } from '../group-switch.tsx'
import { type Grouping, toGrouping } from '../grouping.ts'
import { IssueList } from '../issue-list.tsx'
import { IssuesPane } from '../issues-pane.tsx'

/** Список — вид по умолчанию: подробности строкой, всё на одном экране. */
export const Route = createFileRoute('/w/$slug/')({ component: ListView })

function ListView() {
  const { group } = Route.useSearch()
  const navigate = Route.useNavigate()
  const grouping = toGrouping(group)

  const pick = useCallback(
    (next: Grouping | undefined) => {
      // `replace` — как и у фильтров: «назад» уводит со страницы, а не
      // отматывает по одной перестановке заголовков.
      void navigate({
        search: (previous) => ({ ...previous, group: next }),
        replace: true
      })
    },
    [navigate]
  )

  return (
    <>
      <GroupSwitch value={grouping} onPick={pick} />
      <IssuesPane>
        {(issues) => <IssueList issues={issues} grouping={grouping} />}
      </IssuesPane>
    </>
  )
}
