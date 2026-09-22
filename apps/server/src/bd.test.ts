import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { BdError, runBdJson } from './bd.ts'

/** Подставной `bd`: печатает заданное и выходит с заданным кодом. */
function fakeBd(output: string, code: number): string {
  const directory = mkdtempSync(join(tmpdir(), 'beadle-bd-'))
  const path = join(directory, 'bd')
  writeFileSync(path, `#!/bin/sh\ncat <<'OUT'\n${output}\nOUT\nexit ${code}\n`)
  chmodSync(path, 0o755)
  return path
}

afterEach(() => {
  delete process.env.BD_BIN
})

describe('runBdJson', () => {
  it('разбирает обычный ответ', async () => {
    process.env.BD_BIN = fakeBd('[{"id":"tst-1"}]', 0)

    await expect(runBdJson(tmpdir(), ['list'])).resolves.toEqual([
      { id: 'tst-1' }
    ])
  })

  it('считает ответом JSON, отданный с кодом ошибки: так `bd` сообщает о промахе', async () => {
    process.env.BD_BIN = fakeBd('{"error":"no issues found"}', 1)

    await expect(runBdJson(tmpdir(), ['show', 'нет'])).resolves.toEqual({
      error: 'no issues found'
    })
  })

  it('падение без JSON остаётся аварией', async () => {
    process.env.BD_BIN = fakeBd('command not found', 127)

    await expect(runBdJson(tmpdir(), ['list'])).rejects.toBeInstanceOf(BdError)
  })

  it('ответ не-JSON тоже авария', async () => {
    process.env.BD_BIN = fakeBd('ничего похожего на json', 0)

    await expect(runBdJson(tmpdir(), ['list'])).rejects.toBeInstanceOf(BdError)
  })
})
