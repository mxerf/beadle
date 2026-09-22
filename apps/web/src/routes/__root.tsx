import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import * as styles from './__root.css.ts'

/**
 * Общая рамка. Проект в ней не хранится: он приходит из адреса в каждом
 * маршруте, поэтому шапка знает только дорогу к списку проектов.
 */
export const Route = createRootRoute({ component: RootLayout })

function RootLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          beadle
        </Link>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
