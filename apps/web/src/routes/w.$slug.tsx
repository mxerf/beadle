import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useCallback } from 'react'

import { issuesQuery } from '../api.ts'
import { plural } from '../captions.ts'
import { IssueFilters } from '../issue-filters.tsx'
import { IssueList } from '../issue-list.tsx'
import { Notice } from '../notice.tsx'
import { type IssueSearch, issueSearchSchema } from '../search.ts'
import * as styles from './w.$slug.css.ts'

/**
 * Задачи одного проекта. Проект и фильтры целиком лежат в адресе, поэтому
 * вкладка ни на что не влияет: ссылку можно открыть рядом и получить то же
 * самое, а не переключить чужую доску.
 */
export const Route = createFileRoute('/w/$slug')({
  validateSearch: issueSearchSchema,
  component: WorkspaceIssues
})

function WorkspaceIssues() {
  const { slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, status, error, isFetching } = useQuery(
    issuesQuery(slug, search)
  )

  const change = useCallback(
    (patch: Partial<IssueSearch>) => {
      // `replace` — чтобы «назад» уводило со страницы, а не отматывало
      // историю фильтров по одному нажатию на кнопку.
      void navigate({
        search: (prev) => ({ ...prev, ...patch }),
        replace: true
      })
    },
    [navigate]
  )

  function body(): ReactNode {
    if (status === 'error') {
      return <Notice tone="failure">{error.message}</Notice>
    }
    if (status === 'pending') {
      return <Notice>Спрашиваю у bd…</Notice>
    }
    if (data.issues.length === 0) {
      return <Notice>Под фильтры ничего не попало.</Notice>
    }
    return <IssueList issues={data.issues} />
  }

  return (
    <>
      <header className={styles.head}>
        <h1 className={styles.name}>{data?.workspace.name ?? slug}</h1>
        <span className={styles.counts}>
          {isFetching ? 'спрашиваю у bd…' : countsCaption(data?.issues)}
        </span>
      </header>
      <IssueFilters search={search} onChange={change} />
      {body()}
    </>
  )
}

function countsCaption(issues: readonly { blocked: boolean }[] | undefined) {
  if (!issues) {
    return ''
  }
  const blocked = issues.filter((issue) => issue.blocked).length
  const shown = `${issues.length} ${plural(issues.length, 'задача', 'задачи', 'задач')}`
  return blocked > 0 ? `${shown} · ${blocked} заблокировано` : shown
}
