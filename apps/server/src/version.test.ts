import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { VERSION } from './version.ts'

describe('VERSION', () => {
  it('совпадает с версией в корневом package.json', () => {
    const path = join(import.meta.dirname, '..', '..', '..', 'package.json')
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
    const version =
      typeof parsed === 'object' && parsed !== null && 'version' in parsed
        ? parsed.version
        : undefined

    expect(version).toBe(VERSION)
  })

  it('выглядит как версия', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
