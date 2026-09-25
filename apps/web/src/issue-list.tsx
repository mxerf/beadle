import type { IssueView } from '@beadle/protocol'
import { useCallback, useState } from 'react'

import {
  plural,
  priorityCaption,
  priorityTone,
  typeCaption
} from './captions.ts'
import { chip } from './chip.css.ts'
import { useCopy } from './clipboard.ts'
import { CopyId } from './copy-id.tsx'
import { GroupSwitch } from './group-switch.tsx'
import { type Grouping, groupIssues, type IssueGroup } from './grouping.ts'
import { IssueRoute } from './issue-link.tsx'
import * as styles from './issue-list.css.ts'
import { Markdown } from './markdown.tsx'
import { byImportance } from './ordering.ts'
import { StatusTag } from './status-tag.tsx'
import { statusOrder, useStatuses } from './statuses.ts'
import * as tag from './tag.css.ts'

/**
 * Список задач: самое срочное сверху, остальное — вниз по важности.
 * Группировка разводит список по островкам — так же, как эпики: группа
 * читается как одно целое, и заголовок принадлежит ей, а не пространству
 * над строками.
 */
export function IssueList({
  issues,
  grouping,
  onGroup
}: {
  issues: readonly IssueView[]
  grouping?: Grouping | undefined
  onGroup: (next: Grouping | undefined) => void
}) {
  const statuses = useStatuses()
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set())
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set())
  const [folded, setFolded] = useState<ReadonlySet<string>>(() => new Set())

  const groups = grouping
    ? groupIssues(issues, grouping, statusOrder(statuses, issues))
    : undefined
  // Порядок показа — он же порядок номеров в буфере.
  const shown = groups
    ? groups.flatMap((group) => group.issues)
    : issues.toSorted(byImportance)
  const ids = shown.map((issue) => issue.id)
  // Выбор держится только за показанное: задача, ушедшая из-под фильтра,
  // в буфер попасть не должна — человек её уже не видит.
  const chosen = ids.filter((id) => picked.has(id))

  const allOpen = ids.length > 0 && ids.every((id) => open.has(id))
  // Ключ свёрнутой группы несёт измерение: `1` в приоритетах и `1`
  // где-нибудь ещё — разные группы, и сворачивание не должно переезжать
  // вместе со сменой группировки.
  const foldKeys = groups?.map((group) => `${grouping}:${group.key}`) ?? []
  const allFolded =
    foldKeys.length > 0 && foldKeys.every((key) => folded.has(key))

  const onPick = useCallback((id: string) => {
    setPicked((previous) => toggled(previous, id))
  }, [])
  const onExpand = useCallback((id: string) => {
    setOpen((previous) => toggled(previous, id))
  }, [])
  const onFold = useCallback((key: string) => {
    setFolded((previous) => toggled(previous, key))
  }, [])
  const state: RowState = { picked, open, onPick, onExpand }

  return (
    <>
      <div className={styles.toolbar}>
        <GroupSwitch value={grouping} onPick={onGroup} />
        <div className={styles.actions}>
          {groups ? (
            <button
              type="button"
              className={chip[allFolded ? 'on' : 'off']}
              aria-pressed={allFolded}
              onClick={() =>
                setFolded(allFolded ? new Set() : new Set(foldKeys))
              }
            >
              Свернуть группы
            </button>
          ) : null}
          <button
            type="button"
            className={chip[allOpen ? 'on' : 'off']}
            aria-pressed={allOpen}
            onClick={() => setOpen(allOpen ? new Set() : new Set(ids))}
          >
            Развернуть все
          </button>
          <CopyIds ids={ids} caption={`Скопировать номера · ${ids.length}`} />
        </div>
      </div>
      {groups ? (
        <div className={styles.islands}>
          {groups.map((group) => {
            const key = `${grouping}:${group.key}`
            const shut = folded.has(key)
            return (
              <section key={group.key} className={styles.list}>
                <GroupHead
                  group={group}
                  folded={shut}
                  onFold={() => onFold(key)}
                />
                {shut ? null : <Rows issues={group.issues} state={state} />}
              </section>
            )
          })}
        </div>
      ) : (
        <div className={styles.list}>
          <Rows issues={shown} state={state} />
        </div>
      )}
      {chosen.length > 0 ? (
        <Picked ids={chosen} onClear={() => setPicked(new Set())} />
      ) : null}
    </>
  )
}

/** Множество с переключённым значением — для выбора и для разворота строк. */
function toggled(
  previous: ReadonlySet<string>,
  id: string
): ReadonlySet<string> {
  const next = new Set(previous)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

/**
 * Что человек сделал со строками: отметил и развернул. Живёт в списке,
 * а не в адресе: это ход чтения, а не состояние экрана, которым делятся.
 */
type RowState = {
  picked: ReadonlySet<string>
  open: ReadonlySet<string>
  onPick: (id: string) => void
  onExpand: (id: string) => void
}

function Rows({
  issues,
  state
}: {
  issues: readonly IssueView[]
  state: RowState
}) {
  return issues.map((issue) => (
    <IssueRow key={issue.id} issue={issue} state={state} />
  ))
}

/**
 * Номера через пробел: так их ждёт `bd show a b c`, и так же они
 * вставляются в сообщение, не превращаясь в столбик.
 */
function CopyIds({
  ids,
  caption,
  onIsland = false
}: {
  ids: readonly string[]
  caption: string
  /** Кнопка стоит на тёмном острове, а не на полотне. */
  onIsland?: boolean
}) {
  const { copied, copy } = useCopy()

  return (
    <button
      type="button"
      className={onIsland ? styles.islandAction : chip[copied ? 'on' : 'off']}
      onClick={() => copy(ids.join(' '))}
    >
      {copied ? 'Скопировано' : caption}
    </button>
  )
}

/**
 * Выбранное — островом внизу экрана, а не кнопкой над списком: выбирают
 * по ходу чтения, и к моменту копирования шапка списка давно уехала вверх.
 */
function Picked({
  ids,
  onClear
}: {
  ids: readonly string[]
  onClear: () => void
}) {
  return (
    <>
      {/* Место под островом: иначе в конце списка он закрыл бы последние
          строки, и дотянуться до них было бы нечем. */}
      <div className={styles.pickedRoom} />
      <aside className={styles.picked} aria-label="Выбранные задачи">
        <span className={styles.pickedCount}>Выбрано: {ids.length}</span>
        <CopyIds ids={ids} caption="Скопировать номера" onIsland />
        <button type="button" className={styles.islandAction} onClick={onClear}>
          Снять выбор
        </button>
      </aside>
    </>
  )
}

/**
 * Кто держит задачу. «Заблокирована» отвечает на вопрос, который человек
 * задаёт вторым: первым он спрашивает «кем» — и без номера всё равно идёт
 * на страницу выяснять. Держателей бывает несколько, но в строке помещается
 * один; остальные — в подсказке.
 */
function Held({ ids }: { ids: readonly string[] }) {
  const first = ids[0]
  if (!first) {
    return null
  }

  return (
    <span className={tag.tone.danger} title={`Держат: ${ids.join(', ')}`}>
      ждёт {first}
      {ids.length > 1 ? ` и ещё ${ids.length - 1}` : ''}
    </span>
  )
}

/**
 * Заголовок группы сворачивает её до себя: в группировке по эпикам
 * их десятки, и чтобы дойти до нужного, остальные убирают с дороги.
 * Заголовок эпика — ссылка на него, поэтому сворачивает шеврон, а не он.
 */
function GroupHead({
  group,
  folded,
  onFold
}: {
  group: IssueGroup
  folded: boolean
  onFold: () => void
}) {
  const count = group.issues.length

  return (
    <div className={styles.groupHead}>
      <button
        type="button"
        className={styles.expand}
        aria-expanded={!folded}
        title={folded ? 'Развернуть группу' : 'Свернуть группу'}
        onClick={onFold}
      >
        <svg {...CHEVRON} className={styles.chevron[folded ? 'shut' : 'open']}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
      {group.issueId ? (
        <IssueRoute id={group.issueId} className={styles.groupLink}>
          {group.caption}
        </IssueRoute>
      ) : (
        <span className={styles.groupCaption}>{group.caption}</span>
      )}
      <span className={styles.groupCount}>
        {count} {plural(count, 'задача', 'задачи', 'задач')}
      </span>
    </div>
  )
}

function IssueRow({ issue, state }: { issue: IssueView; state: RowState }) {
  const open = state.open.has(issue.id)
  const more = `more-${issue.id}`

  return (
    <div className={styles.row}>
      <input
        type="checkbox"
        className={styles.pick}
        checked={state.picked.has(issue.id)}
        onChange={() => state.onPick(issue.id)}
        aria-label={`Выбрать ${issue.id}`}
      />
      <IssueRoute id={issue.id} className={styles.rowLink}>
        <span className={tag.tone[priorityTone(issue.priority)]}>
          {priorityCaption(issue.priority)}
        </span>
        <span className={tag.tone.quiet}>{typeCaption[issue.issue_type]}</span>
        <span className={styles.titleCell}>
          <span
            className={[
              styles.title[open ? 'open' : 'shut'],
              issue.status === 'closed' ? styles.closed : ''
            ].join(' ')}
            // Подсказка нужна обрезанному заголовку, развёрнутый виден весь.
            title={open ? undefined : issue.title}
          >
            {issue.title}
          </span>
          {issue.labels.map((label) => (
            <span key={label} className={tag.tone.neutral}>
              {label}
            </span>
          ))}
        </span>
        <span className={styles.assignee}>{issue.assignee ?? ''}</span>
        <span className={styles.flag}>
          <Held ids={issue.blocked_by} />
        </span>
        <StatusTag status={issue.status} />
      </IssueRoute>
      <CopyId id={issue.id} className={styles.idCell} />
      <button
        type="button"
        className={styles.expand}
        aria-expanded={open}
        aria-controls={more}
        title={open ? 'Свернуть' : 'Развернуть'}
        onClick={() => state.onExpand(issue.id)}
      >
        <svg {...CHEVRON} className={styles.chevron[open ? 'open' : 'shut']}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
      {open ? (
        <div id={more} className={styles.more}>
          {issue.acceptance_criteria ? (
            <>
              <div className={styles.moreTitle}>Критерии приёмки</div>
              <Markdown>{issue.acceptance_criteria}</Markdown>
            </>
          ) : (
            <p className={styles.moreEmpty}>Критериев приёмки нет</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

const CHEVRON = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
} as const
