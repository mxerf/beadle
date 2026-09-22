import { chip } from './chip.css.ts'
import * as styles from './group-switch.css.ts'
import { type Grouping, GROUPINGS, groupingCaption } from './grouping.ts'

/**
 * Выбор измерения для списка. Измерение одно: список, разбитый сразу
 * по двум, перестаёт быть списком. Повторное нажатие на включённую
 * таблетку возвращает плоский список — тот же жест, что и у фильтров.
 */
export function GroupSwitch({
  value,
  onPick
}: {
  value: Grouping | undefined
  onPick: (next: Grouping | undefined) => void
}) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>Группировать по</span>
      {GROUPINGS.map((grouping) => (
        <button
          key={grouping}
          type="button"
          className={chip[grouping === value ? 'on' : 'off']}
          aria-pressed={grouping === value}
          onClick={() => onPick(grouping === value ? undefined : grouping)}
        >
          {groupingCaption[grouping]}
        </button>
      ))}
    </div>
  )
}
