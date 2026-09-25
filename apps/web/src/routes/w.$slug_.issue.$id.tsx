import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback } from 'react'

import { issueQuery, statusesQuery } from '../api.ts'
import { useDocumentTitle } from '../document-title.ts'
import { Failure } from '../failure.tsx'
import * as styles from '../issue-detail.css.ts'
import { IssueDetail } from '../issue-detail.tsx'
import { useLiveUpdates } from '../live.ts'
import { Notice } from '../notice.tsx'
import { issueSearchSchema } from '../search.ts'

/**
 * Страница задачи. Маршрут не вложен в раскладку проекта: фильтры и
 * переключатель видов здесь ни при чём, но фильтры всё равно разбираются —
 * они едут в адресе, чтобы «назад» вернуло к тому же отбору, из которого
 * человек сюда пришёл.
 */
export const Route = createFileRoute('/w/$slug_/issue/$id')({
  validateSearch: issueSearchSchema,
  component: IssuePage
})

function IssuePage() {
  const { slug, id } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data, status, error } = useQuery(issueQuery(slug, id))
  // Словарь — ради цвета тегов у задачи и её связей: без него они серые.
  const statuses = useQuery(statusesQuery(slug))

  // Страница задачи живёт вне раскладки проекта, поэтому за новостями
  // следит сама: правку, сделанную в терминале, видно и здесь.
  useLiveUpdates(slug)

  // Номер впереди заголовка: во вкладке видно начало строки, а номер
  // короткий, всегда разный и называет заодно проект.
  useDocumentTitle(data ? `${data.issue.id} · ${data.issue.title}` : id)

  const reset = useCallback(() => {
    void navigate({ search: {}, replace: true })
  }, [navigate])

  const failed = error ?? statuses.error

  return (
    <>
      <Link
        to="/w/$slug"
        params={{ slug }}
        search={search}
        className={styles.back}
      >
        ← {data?.workspace.name ?? 'к списку'}
      </Link>
      {failed ? <Failure error={failed} onReset={reset} /> : null}
      {!failed && (status === 'pending' || statuses.isPending) ? (
        <Notice>Спрашиваю у bd…</Notice>
      ) : null}
      {status === 'success' && statuses.isSuccess ? (
        <IssueDetail slug={slug} issue={data.issue} />
      ) : null}
    </>
  )
}
