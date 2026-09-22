import { Link, useParams } from '@tanstack/react-router'

import { WORKSPACE_ROUTE } from './issues-pane.tsx'
import * as styles from './view-switch.css.ts'

/**
 * Вид — часть адреса, как и проект с фильтрами: доска, открытая по ссылке,
 * открывается доской. Фильтры при переключении сохраняются — человек
 * смотрит тот же отбор с другой стороны, а не начинает заново.
 */
const VIEWS = [
  { to: '/w/$slug', caption: 'Список' },
  { to: '/w/$slug/board', caption: 'Доска' },
  { to: '/w/$slug/epics', caption: 'Эпики' }
] as const

export function ViewSwitch() {
  const { slug } = useParams({ from: WORKSPACE_ROUTE })

  return (
    <nav className={styles.nav}>
      {VIEWS.map((view) => (
        <Link
          key={view.to}
          to={view.to}
          params={{ slug }}
          search={(previous) => previous}
          activeOptions={{ exact: true }}
          className={styles.tab.off}
          activeProps={{ className: styles.tab.on }}
        >
          {view.caption}
        </Link>
      ))}
    </nav>
  )
}
