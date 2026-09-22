import { Fragment } from 'react'

import * as styles from './hints.css.ts'

/** Подписи те, что напечатаны на клавише: код кодом, а жмут по надписи. */
const KEYS: ReadonlyArray<readonly [string, string]> = [
  ['/', 'искать'],
  ['1 … 4', 'вид'],
  ['j k', 'соседняя задача'],
  ['Enter', 'открыть'],
  ['r', 'обновить'],
  ['?', 'эта подсказка']
]

export function Hints({ onClose }: { onClose: () => void }) {
  return (
    <aside className={styles.island} aria-label="Горячие клавиши">
      <div className={styles.head}>
        <span className={styles.name}>Клавиши</span>
        <button type="button" className={styles.close} onClick={onClose}>
          Esc
        </button>
      </div>
      <dl className={styles.rows}>
        {KEYS.map(([key, what]) => (
          <Fragment key={key}>
            <dt className={styles.key}>{key}</dt>
            <dd className={styles.what}>{what}</dd>
          </Fragment>
        ))}
      </dl>
    </aside>
  )
}
