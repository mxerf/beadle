import { useEffect, useRef, useState } from 'react'

import {
  PRIORITIES,
  priorityCaption,
  STATUSES,
  statusCaption,
  TYPES,
  typeCaption
} from './captions.ts'
import * as styles from './issue-filters.css.ts'
import { type IssueSearch, toggleValue, toValues } from './search.ts'

/** Пауза перед тем, как строка поиска уедет в адрес и в запрос. */
const TYPING_PAUSE_MS = 300

type Props = {
  search: IssueSearch
  onChange: (patch: Partial<IssueSearch>) => void
  /**
   * Сброс — своё действие, а не пустой патч: патч сливается с прежним
   * состоянием, и пустой патч не убирает из адреса ровно ничего.
   */
  onReset: () => void
}

export function IssueFilters({ search, onChange, onReset }: Props) {
  const text = useSearchText(search.search, onChange)

  return (
    <div className={styles.bar}>
      <Group
        values={toValues(search.status)}
        options={STATUSES.map((value) => [value, statusCaption[value]])}
        onToggle={(value) =>
          onChange({ status: toggleValue(search.status, value) })
        }
      />
      <Group
        values={toValues(search.type)}
        options={TYPES.map((value) => [value, typeCaption[value]])}
        onToggle={(value) =>
          onChange({ type: toggleValue(search.type, value) })
        }
      />
      <Group
        values={toValues(search.priority)}
        options={PRIORITIES.map((value) => [
          String(value),
          priorityCaption(value)
        ])}
        onToggle={(value) =>
          onChange({ priority: toggleValue(search.priority, value) })
        }
      />
      <input
        className={styles.search}
        value={text.value}
        onChange={(event) => text.set(event.target.value)}
        placeholder="Поиск по номеру, заголовку и описанию"
        type="search"
        aria-label="Поиск по задачам"
      />
      <button className={styles.reset} type="button" onClick={onReset}>
        Сбросить
      </button>
    </div>
  )
}

function Group({
  values,
  options,
  onToggle
}: {
  values: readonly string[]
  options: ReadonlyArray<readonly [string, string]>
  onToggle: (value: string) => void
}) {
  return (
    <div className={styles.group}>
      {options.map(([value, caption]) => (
        <button
          key={value}
          type="button"
          className={styles.chip[values.includes(value) ? 'on' : 'off']}
          aria-pressed={values.includes(value)}
          onClick={() => onToggle(value)}
        >
          {caption}
        </button>
      ))}
    </div>
  )
}

/**
 * Строка поиска живёт локально и уезжает в адрес с паузой: каждый запрос —
 * это запуск `bd` на всём проекте, и печатать по нему вслепую дорого.
 * Обратная синхронизация нужна для «назад» и чужой ссылки: адрес там меняется
 * не нами, и поле обязано это заметить.
 */
function useSearchText(
  fromUrl: string | undefined,
  onChange: (patch: Partial<IssueSearch>) => void
) {
  const [value, set] = useState(fromUrl ?? '')
  const sent = useRef(fromUrl ?? '')

  useEffect(() => {
    const current = fromUrl ?? ''
    if (current !== sent.current) {
      sent.current = current
      set(current)
    }
  }, [fromUrl])

  useEffect(() => {
    if (value === sent.current) {
      return undefined
    }
    const timer = setTimeout(() => {
      sent.current = value
      onChange({ search: value || undefined })
    }, TYPING_PAUSE_MS)
    return () => clearTimeout(timer)
  }, [value, onChange])

  return { value, set }
}
