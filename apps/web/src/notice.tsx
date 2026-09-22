import type { ReactNode } from 'react'

import * as styles from './notice.css.ts'

/**
 * Сообщение вместо содержимого: ожидание, пустота, отказ. Отдельный компонент
 * ради того, чтобы отказ `bd` выглядел одинаково на всех страницах.
 */
export function Notice({
  tone = 'muted',
  children,
  hint
}: {
  tone?: 'muted' | 'failure'
  children: ReactNode
  // `| undefined` обязателен при `exactOptionalPropertyTypes`: подпись
  // приходит из необязательного поля ответа и бывает буквально undefined.
  hint?: string | undefined
}) {
  return (
    <div className={styles.tone[tone]}>
      {children}
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  )
}
