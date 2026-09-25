import type { Label } from '@beadle/protocol'
import { describe, expect, it } from 'vitest'

import { LABELS_AT_ONCE, pickLabels } from './labels.ts'

/** Лейблы по алфавиту, как их отдаёт `bd`; у последнего счёт самый большой. */
const MANY: Label[] = Array.from(
  { length: LABELS_AT_ONCE + 3 },
  (_, index) => ({
    name: `l${String(index).padStart(2, '0')}`,
    count: index + 1
  })
)

describe('pickLabels', () => {
  it('ставит частые лейблы впереди редких', () => {
    const labels = [
      { name: 'infra', count: 46 },
      { name: 'ai', count: 23 },
      { name: 'release-1.0', count: 95 }
    ]

    expect(pickLabels(labels, [], false)).toEqual({
      shown: ['release-1.0', 'infra', 'ai'],
      hidden: 0
    })
  })

  it('прячет хвост редких и говорит, сколько спрятано', () => {
    const picked = pickLabels(MANY, [], false)

    expect(picked.shown).toHaveLength(LABELS_AT_ONCE)
    expect(picked.shown).not.toContain('l00')
    expect(picked.hidden).toBe(3)
  })

  it('выбранный редкий лейбл не прячет', () => {
    const picked = pickLabels(MANY, ['l00'], false)

    expect(picked.shown).toContain('l00')
    expect(picked.hidden).toBe(2)
  })

  it('показывает лейбл из адреса, которого в проекте уже нет', () => {
    expect(pickLabels(MANY, ['пропавший'], false).shown.at(-1)).toBe(
      'пропавший'
    )
  })

  it('по просьбе показывает все', () => {
    expect(pickLabels(MANY, [], true)).toMatchObject({ hidden: 0 })
    expect(pickLabels(MANY, [], true).shown).toHaveLength(MANY.length)
  })
})
