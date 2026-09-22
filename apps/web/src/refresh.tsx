import type { LiveStatus } from '@beadle/protocol'
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
  live,
  onRefresh
}: {
  updatedAt: number
  fetching: boolean
  live: LiveStatus
  onRefresh: () => void
}) {
  const now = useTick(TICK_MS)

  return (
    <button
      type="button"
      className={styles.refresh}
      title={hint(live)}
      onClick={onRefresh}
    >
      <span className={styles.mark[live.live ? 'live' : 'still']} />
      {caption(updatedAt, now, fetching)}
    </button>
  )
}

/**
 * Подсказка объясняет, ждать ли новостей самому. Когда ждать нечего,
 * она называет команду: человек здесь всё равно рядом с терминалом.
 */
function hint(live: LiveStatus): string {
  if (!live.live) {
    return 'Изменения не отслеживаются: в проекте выключен export.auto. Включается командой bd config set export.auto true. Нажатие спросит bd заново (r)'
  }
  const often = live.interval ? ` не чаще чем раз в ${live.interval}` : ''
  return `Изменения приходят сами${often}. Нажатие спросит bd заново (r)`
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
