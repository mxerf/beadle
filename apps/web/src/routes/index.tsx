import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { workspacesQuery } from '../api.ts'
import { Notice } from '../notice.tsx'
import * as styles from './index.css.ts'

/** Список проектов. Отсюда начинается адрес: дальше всё живёт в `/w/:slug`. */
export const Route = createFileRoute('/')({ component: WorkspacePicker })

function WorkspacePicker() {
  const { data, status, error } = useQuery(workspacesQuery)

  if (status === 'pending') {
    return <Notice>Читаю реестр…</Notice>
  }

  if (status === 'error') {
    return <Notice tone="failure">{error.message}</Notice>
  }

  if (data.length === 0) {
    return (
      <Notice hint="bun apps/server/src/index.ts add ~/путь/к/проекту">
        В реестре нет проектов.
      </Notice>
    )
  }

  return (
    <>
      <h1 className={styles.title}>Проекты</h1>
      <div className={styles.list}>
        {data.map((workspace) => (
          <Link
            key={workspace.slug}
            to="/w/$slug"
            params={{ slug: workspace.slug }}
            className={styles.card}
          >
            <span className={styles.name}>{workspace.name}</span>
            <span className={styles.path}>{workspace.path}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
