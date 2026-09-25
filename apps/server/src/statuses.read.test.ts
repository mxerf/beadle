import { describe, expect, it } from 'vitest'

import { configuredOrder, orderStatuses } from './statuses.read.ts'

/** Встроенные статусы в том виде и порядке, в каком их отдаёт `bd` 1.3.0. */
const BUILT_IN = [
  { name: 'open', category: 'active' },
  { name: 'in_progress', category: 'wip' },
  { name: 'blocked', category: 'wip' },
  { name: 'deferred', category: 'frozen' },
  { name: 'closed', category: 'done' },
  { name: 'pinned', category: 'frozen' },
  { name: 'hooked', category: 'wip' }
] as const

describe('configuredOrder', () => {
  it('берёт из конфига имена, отбрасывая категории', () => {
    expect(configuredOrder('awaiting_staging:wip, awaiting_prod:wip')).toEqual([
      'awaiting_staging',
      'awaiting_prod'
    ])
  })

  it('понимает старую запись без категорий', () => {
    expect(configuredOrder('review,testing')).toEqual(['review', 'testing'])
  })

  it('на незаданном ключе не выдумывает порядка', () => {
    expect(configuredOrder('')).toEqual([])
  })
})

describe('orderStatuses', () => {
  it('выстраивает путь задачи: работа, лёд, закрытие', () => {
    const names = orderStatuses(BUILT_IN, [], []).map((status) => status.name)

    expect(names).toEqual([
      'open',
      'in_progress',
      'blocked',
      'hooked',
      'deferred',
      'pinned',
      'closed'
    ])
  })

  it('ставит свои статусы в порядке конфига, а не по алфавиту', () => {
    // Ровно так их отдаёт `bd`: по алфавиту, «прод» раньше «стенда».
    const custom = [
      { name: 'awaiting_prod', category: 'wip' },
      { name: 'awaiting_staging', category: 'wip' }
    ] as const
    const configured = configuredOrder('awaiting_staging:wip,awaiting_prod:wip')

    const names = orderStatuses(BUILT_IN, custom, configured).map(
      (status) => status.name
    )

    expect(names).toEqual([
      'open',
      'in_progress',
      'blocked',
      'hooked',
      'awaiting_staging',
      'awaiting_prod',
      'deferred',
      'pinned',
      'closed'
    ])
  })

  it('разводит свои статусы по категориям и помечает их', () => {
    const custom = [
      { name: 'archived', category: 'done' },
      { name: 'legacy', category: 'unspecified' },
      { name: 'triage', category: 'active' }
    ] as const

    const ordered = orderStatuses(BUILT_IN, custom, [])

    expect(ordered.map((status) => status.name)).toEqual([
      'open',
      'triage',
      'in_progress',
      'blocked',
      'hooked',
      'legacy',
      'deferred',
      'pinned',
      'closed',
      'archived'
    ])
    expect(ordered.find((status) => status.name === 'triage')?.custom).toBe(
      true
    )
    expect(ordered.find((status) => status.name === 'open')?.custom).toBe(false)
  })

  it('свой статус, которого нет в конфиге, оставляет на месте из bd', () => {
    const custom = [
      { name: 'alpha', category: 'wip' },
      { name: 'beta', category: 'wip' }
    ] as const

    const names = orderStatuses([], custom, ['beta']).map(
      (status) => status.name
    )

    expect(names).toEqual(['beta', 'alpha'])
  })
})
