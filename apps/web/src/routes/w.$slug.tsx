import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useCallback } from 'react'

import { issuesQuery } from '../api.ts'
import { plural } from '../captions.ts'
import { useDocumentTitle } from '../document-title.ts'
import { IssueFilters } from '../issue-filters.tsx'
import { type IssueSearch, issueSearchSchema } from '../search.ts'
import { ViewSwitch } from '../view-switch.tsx'
import { useViewCaption } from '../views.ts'
import * as styles from './w.$slug.css.ts'

/**
 * Раскладка проекта: шапка, фильтры и переключатель видов. Проект, фильтры
 * и сам вид целиком лежат в адресе, поэтому вкладка ни на что не влияет:
 * ссылку можно открыть рядом и получить то же самое, а не переключить
 * чужую доску.
 */
export const Route = createFileRoute('/w/$slug')({
  validateSearch: issueSearchSchema,
  component: WorkspaceLayout
})

function WorkspaceLayout() {
  const { slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  // Тот же запрос, что у вида: ключ совпадает, поэтому `bd` не спрашивают
  // дважды — шапка читает уже привезённое.
  const { data, isFetching } = useQuery(issuesQuery(slug, search))

  const change = useCallback(
    (patch: Partial<IssueSearch>) => {
      // `replace` — чтобы «назад» уводило со страницы, а не отматывало
      // историю фильтров по одному нажатию на кнопку.
      void navigate({
        search: (previous) => ({ ...previous, ...patch }),
        replace: true
      })
    },
    [navigate]
  )

  // Сброс убирает отбор, но не раскладку: группировка — про то, как
  // смотреть, и к фильтрам, которые человек сбрасывает, отношения не имеет.
  const reset = useCallback(() => {
    void navigate({
      search: (previous) => ({ group: previous.group }),
      replace: true
    })
  }, [navigate])

  const name = data?.workspace.name ?? slug
  const view = useViewCaption(slug)
  useDocumentTitle([name, view].filter(Boolean).join(' · '))

  return (
    <>
      <header className={styles.head}>
        <h1 className={styles.name}>{name}</h1>
        <span className={styles.counts}>
          {isFetching ? 'спрашиваю у bd…' : countsCaption(data?.issues)}
        </span>
        <ViewSwitch />
      </header>
      <IssueFilters search={search} onChange={change} onReset={reset} />
      <Outlet />
    </>
  )
}

function countsCaption(
  issues: readonly { blocked_by: readonly string[] }[] | undefined
) {
  if (!issues) {
    return ''
  }
  const blocked = issues.filter((issue) => issue.blocked_by.length > 0).length
  const shown = `${issues.length} ${plural(issues.length, 'задача', 'задачи', 'задач')}`
  return blocked > 0 ? `${shown} · ${blocked} заблокировано` : shown
}
