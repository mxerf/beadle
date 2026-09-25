import { describe, expect, it } from 'vitest'

import { parseFilters } from './app.ts'

/** Встроенные статусы `bd` — словарь проекта без своих. */
const BUILT_IN = new Set([
  'open',
  'in_progress',
  'blocked',
  'deferred',
  'closed',
  'pinned',
  'hooked'
])

describe('parseFilters', () => {
  it('разбирает списки через запятую и числовые приоритеты', () => {
    const parsed = parseFilters(
      { status: 'open,in_progress', priority: '0,1' },
      BUILT_IN
    )

    expect(parsed).toEqual({
      ok: true,
      filters: { status: ['open', 'in_progress'], priority: [0, 1] }
    })
  })

  it('пустой адрес — пустые фильтры, а не отказ', () => {
    expect(parseFilters({}, BUILT_IN)).toEqual({ ok: true, filters: {} })
  })

  it('отказывает на неизвестном статусе и называет поле и значение', () => {
    const parsed = parseFilters({ status: 'open,чушь' }, BUILT_IN)

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields[0]?.path).toBe('status.1')
      expect(parsed.fields[0]?.message).toContain('чушь')
    }
  })

  it('принимает свой статус проекта, если он есть в словаре', () => {
    const known = new Set([...BUILT_IN, 'awaiting_prod'])

    expect(parseFilters({ status: 'awaiting_prod' }, known)).toEqual({
      ok: true,
      filters: { status: ['awaiting_prod'] }
    })
    expect(parseFilters({ status: 'awaiting_prod' }, BUILT_IN).ok).toBe(false)
  })

  it('отказывает на приоритете, который не число', () => {
    const parsed = parseFilters({ priority: 'срочно' }, BUILT_IN)

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields[0]?.path).toBe('priority.0')
    }
  })

  it('разбирает флаг обеими записями', () => {
    expect(parseFilters({ ready: '1' }, BUILT_IN)).toEqual({
      ok: true,
      filters: { ready: true }
    })
    expect(parseFilters({ ready: 'false' }, BUILT_IN)).toEqual({
      ok: true,
      filters: { ready: false }
    })
  })

  it('отказывает на флаге, который не да и не нет', () => {
    const parsed = parseFilters({ ready: 'ага' }, BUILT_IN)

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields[0]?.path).toBe('ready')
    }
  })

  it('называет все непонятные поля разом, а не первое', () => {
    const parsed = parseFilters({ status: 'чушь', type: 'ерунда' }, BUILT_IN)

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields.map((field) => field.path)).toEqual([
        'status.0',
        'type.0'
      ])
    }
  })
})
