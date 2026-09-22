import { useEffect, useState } from 'react'

import { formatAgo } from './captions.ts'
import * as styles from './refresh.css.ts'

/** Как часто пересчитывается давность: чаще незачем, реже — уже врёт. */
const TICK_MS = 20_000

/**
 * Давность данных и способ их обновить — одним элементом. Живого обновления
 * из `.beads` пока нет, поэтому экран молча стареет: человек обязан видеть,
 * насколько, и уметь спросить заново, не перезагружая вкладку.
 */
export function Refresh({
  updatedAt,
  fetching,
  onRefresh
}: {
  updatedAt: number
  fetching: boolean
  onRefresh: () => void
}) {
  const now = useTick(TICK_MS)

  return (
    <button
      type="button"
      className={styles.refresh}
      title="Спросить bd заново (r)"
      onClick={onRefresh}
    >
      {caption(updatedAt, now, fetching)}
    </button>
  )
}

function caption(updatedAt: number, now: number, fetching: boolean): string {
  if (fetching) {
    return 'спрашиваю у bd…'
  }
  // Данных ещё не было — показывать «обновлено 56 лет назад» неоткуда.
  return updatedAt > 0 ? `обновлено ${formatAgo(now - updatedAt)}` : 'обновить'
}

function useTick(every: number): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(timer)
  }, [every])

  return now
}
