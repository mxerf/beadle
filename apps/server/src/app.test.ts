import { describe, expect, it } from 'vitest'

import { parseFilters } from './app.ts'

describe('parseFilters', () => {
  it('разбирает списки через запятую и числовые приоритеты', () => {
    const parsed = parseFilters({ status: 'open,in_progress', priority: '0,1' })

    expect(parsed).toEqual({
      ok: true,
      filters: { status: ['open', 'in_progress'], priority: [0, 1] }
    })
  })

  it('пустой адрес — пустые фильтры, а не отказ', () => {
    expect(parseFilters({})).toEqual({ ok: true, filters: {} })
  })

  it('отказывает на неизвестном статусе и называет поле', () => {
    const parsed = parseFilters({ status: 'чушь' })

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields[0]?.path).toBe('status.0')
      expect(parsed.fields[0]?.message).toBeTruthy()
    }
  })

  it('отказывает на приоритете, который не число', () => {
    const parsed = parseFilters({ priority: 'срочно' })

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields[0]?.path).toBe('priority.0')
    }
  })

  it('разбирает флаг обеими записями', () => {
    expect(parseFilters({ ready: '1' })).toEqual({
      ok: true,
      filters: { ready: true }
    })
    expect(parseFilters({ ready: 'false' })).toEqual({
      ok: true,
      filters: { ready: false }
    })
  })

  it('отказывает на флаге, который не да и не нет', () => {
    const parsed = parseFilters({ ready: 'ага' })

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields[0]?.path).toBe('ready')
    }
  })

  it('называет все непонятные поля разом, а не первое', () => {
    const parsed = parseFilters({ status: 'чушь', type: 'ерунда' })

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.fields.map((field) => field.path)).toEqual([
        'status.0',
        'type.0'
      ])
    }
  })
})
