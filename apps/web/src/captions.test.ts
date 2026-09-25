import { describe, expect, it } from 'vitest'

import {
  formatAgo,
  formatDuration,
  plural,
  statusCaption,
  statusTone,
  TYPES,
  typeCaption
} from './captions.ts'

describe('plural', () => {
  it.each([
    [0, 'задач'],
    [1, 'задача'],
    [2, 'задачи'],
    [4, 'задачи'],
    [5, 'задач'],
    [11, 'задач'],
    [14, 'задач'],
    [21, 'задача'],
    [102, 'задачи'],
    [467, 'задач']
  ])('%i → %s', (count, expected) => {
    expect(plural(count, 'задача', 'задачи', 'задач')).toBe(expected)
  })
})

describe('подписи', () => {
  it('покрывают все значения контракта', () => {
    for (const type of TYPES) {
      expect(typeCaption[type]).toBeTruthy()
    }
  })

  it('переводят встроенные статусы bd', () => {
    for (const status of [
      'open',
      'in_progress',
      'blocked',
      'deferred',
      'closed',
      'pinned',
      'hooked'
    ]) {
      expect(statusCaption(status)).not.toBe(status)
    }
  })

  it('свой статус проекта показывают его именем', () => {
    expect(statusCaption('awaiting_prod')).toBe('awaiting prod')
  })
})

describe('statusTone', () => {
  it('красит по категории, а статус без словаря — серым', () => {
    expect(statusTone('wip')).toBe('warning')
    expect(statusTone('done')).toBe('brand')
    expect(statusTone(undefined)).toBe('neutral')
  })
})

describe('formatDuration', () => {
  it.each([
    [30, '30 мин'],
    [60, '1 ч'],
    [90, '1,5 ч'],
    [480, '1 дн'],
    [720, '1,5 дн']
  ])('%i минут → %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected)
  })
})

describe('formatAgo', () => {
  it('свежее полминуты — «только что», а не «0 минут назад»', () => {
    expect(formatAgo(0)).toBe('только что')
    expect(formatAgo(44_000)).toBe('только что')
  })

  it('склоняет минуты, часы и дни', () => {
    expect(formatAgo(60_000)).toBe('1 минуту назад')
    expect(formatAgo(3 * 60_000)).toBe('3 минуты назад')
    expect(formatAgo(20 * 60_000)).toBe('20 минут назад')
    expect(formatAgo(2 * 3_600_000)).toBe('2 часа назад')
    expect(formatAgo(50 * 3_600_000)).toBe('2 дня назад')
  })

  it('отрицательное время не показывает будущим', () => {
    expect(formatAgo(-5000)).toBe('только что')
  })
})
