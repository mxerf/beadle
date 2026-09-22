import { describe, expect, it } from 'vitest'

import {
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
