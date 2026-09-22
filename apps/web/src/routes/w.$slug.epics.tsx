import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { issuesQuery } from '../api.ts'
import { plural } from '../captions.ts'
import { Failure } from '../failure.tsx'
import { IssueTree } from '../issue-tree.tsx'
import { WORKSPACE_ROUTE } from '../issues-pane.tsx'
import { Notice } from '../notice.tsx'
import { buildTree, progressByIssue, pruneTree } from '../tree.ts'
import * as styles from './w.$slug.epics.css.ts'

/** Эпики: структура проекта — что под чем лежит и сколько из этого закрыто. */
export const Route = createFileRoute('/w/$slug/epics')({ component: EpicsView })

function EpicsView() {
  const { slug } = Route.useParams()
  const search = useSearch({ from: WORKSPACE_ROUTE })
  const navigate = useNavigate({ from: WORKSPACE_ROUTE })

  /**
   * Запросов два. Отбор отвечает на вопрос «что показать», а структура нужна
   * целиком: фильтр выбрасывает родителя, под которым остались подошедшие
   * дети, и ветка повисла бы без заголовка. Без фильтров ключ совпадает,
   * и `bd` спрашивают один раз.
   */
  const structure = useQuery(issuesQuery(slug, {}))
  const selection = useQuery(issuesQuery(slug, search))

  const matched = useMemo(
    () => new Set(selection.data?.issues.map((issue) => issue.id) ?? []),
    [selection.data]
  )

  const tree = useMemo(
    () => buildTree(structure.data?.issues ?? []),
    [structure.data]
  )

  // Прогресс — свойство эпика, а не текущего отбора, поэтому считается
  // по целому дереву до обрезки.
  const progress = useMemo(() => progressByIssue(tree), [tree])

  const groups = useMemo(
    () =>
      pruneTree(
        tree.filter((node) => node.children.length > 0),
        (issue) => matched.has(issue.id)
      ),
    [tree, matched]
  )

  /** Одиночки на этой странице не показываются: страница про структуру. */
  const loose = useMemo(
    () =>
      tree.filter(
        (node) => node.children.length === 0 && matched.has(node.issue.id)
      ).length,
    [tree, matched]
  )

  const reset = useCallback(() => {
    void navigate({ search: {}, replace: true })
  }, [navigate])

  const failed = selection.error ?? structure.error
  if (failed) {
    return <Failure error={failed} onReset={reset} />
  }
  if (selection.isPending || structure.isPending) {
    return <Notice>Спрашиваю у bd…</Notice>
  }
  if (groups.length === 0) {
    return <Notice>Под фильтры не попало ни одной ветки.</Notice>
  }

  return (
    <>
      <IssueTree nodes={groups} matched={matched} progress={progress} />
      {loose > 0 ? (
        <p className={styles.loose}>
          Ещё {loose} {plural(loose, 'задача', 'задачи', 'задач')} вне веток —
          они видны в списке.
        </p>
      ) : null}
    </>
  )
}
