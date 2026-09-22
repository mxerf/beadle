import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { issuesQuery } from '../api.ts'
import { plural } from '../captions.ts'
import { useDocumentTitle } from '../document-title.ts'
import { Hints } from '../hints.tsx'
import { IssueFilters } from '../issue-filters.tsx'
import { Refresh } from '../refresh.tsx'
import { type IssueSearch, issueSearchSchema } from '../search.ts'
import { useShortcuts } from '../shortcuts.ts'
import { ViewSwitch } from '../view-switch.tsx'
import { useViewCaption, VIEWS } from '../views.ts'
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
  const { data, isFetching, dataUpdatedAt } = useQuery(
    issuesQuery(slug, search)
  )
  const queryClient = useQueryClient()
  const [hints, setHints] = useState(false)

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

  // Обновляется весь проект, а не запрос этого вида: у эпиков и связей
  // запросов два, и перечитать половину — значит показать половину свежего
  // поверх половины устаревшего.
  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['issues', slug] })
  }, [queryClient, slug])

  useShortcuts({
    onView: useCallback(
      (index: number) => {
        const target = VIEWS[index]
        if (target) {
          void navigate({
            to: target.to,
            params: { slug },
            search: (previous) => previous
          })
        }
      },
      [navigate, slug]
    ),
    // Поле поиска одно на весь экран, поэтому ищется по разметке, а не через
    // ссылку, протянутую через три компонента ради одной клавиши.
    onSearch: useCallback(() => {
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
    }, []),
    onRefresh: refresh,
    onHelp: useCallback(() => setHints((open) => !open), []),
    onEscape: useCallback(() => setHints(false), [])
  })

  const name = data?.workspace.name ?? slug
  const view = useViewCaption(slug)
  useDocumentTitle([name, view].filter(Boolean).join(' · '))

  return (
    <>
      <header className={styles.head}>
        <h1 className={styles.name}>{name}</h1>
        <span className={styles.counts}>{countsCaption(data?.issues)}</span>
        <Refresh
          updatedAt={dataUpdatedAt}
          fetching={isFetching}
          onRefresh={refresh}
        />
        <button
          type="button"
          className={styles.hint}
          title="Горячие клавиши (?)"
          aria-pressed={hints}
          onClick={() => setHints((open) => !open)}
        >
          ?
        </button>
        <ViewSwitch />
      </header>
      <IssueFilters search={search} onChange={change} onReset={reset} />
      <Outlet />
      {hints ? <Hints onClose={() => setHints(false)} /> : null}
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
