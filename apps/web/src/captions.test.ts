import { describe, expect, it } from 'vitest'

import {
  formatDuration,
  plural,
  STATUSES,
  statusCaption,
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
    for (const status of STATUSES) {
      expect(statusCaption[status]).toBeTruthy()
    }
    for (const type of TYPES) {
      expect(typeCaption[type]).toBeTruthy()
    }
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
