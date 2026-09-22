import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { issuesQuery } from '../api.ts'
import { Failure } from '../failure.tsx'
import { buildGraph, pruneGraph } from '../graph.ts'
import { IssueGraph } from '../issue-graph.tsx'
import { WORKSPACE_ROUTE } from '../issues-pane.tsx'
import { Notice } from '../notice.tsx'

/** Связи: что кого держит и с чего можно начинать. */
export const Route = createFileRoute('/w/$slug/graph')({ component: GraphView })

function GraphView() {
  const { slug } = Route.useParams()
  const search = useSearch({ from: WORKSPACE_ROUTE })
  const navigate = useNavigate({ from: WORKSPACE_ROUTE })

  /**
   * Запросов два, как и у эпиков: отбор отвечает, что показать, а связи
   * нужны целиком. Держатель, выброшенный фильтром, — это разорванная
   * цепочка, а цепочка ради того и показана.
   */
  const structure = useQuery(issuesQuery(slug, {}))
  const selection = useQuery(issuesQuery(slug, search))

  const matched = useMemo(
    () => new Set(selection.data?.issues.map((issue) => issue.id) ?? []),
    [selection.data]
  )

  const components = useMemo(
    () => pruneGraph(buildGraph(structure.data?.issues ?? []), matched),
    [structure.data, matched]
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
  if (components.length === 0) {
    return (
      <Notice hint="Связь заводится командой bd dep add">
        Под отбор не попало ни одной связки. Здесь видно только задачи, которые
        кого-то ждут или кого-то держат.
      </Notice>
    )
  }

  return <IssueGraph components={components} matched={matched} />
}
