import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { fingerprint, readLiveSetup } from './changes.ts'

/** Подставной `bd`: отвечает на `config get <ключ>` заданным значением. */
function fakeConfig(values: Record<string, string>): string {
  const directory = mkdtempSync(join(tmpdir(), 'beadle-cfg-'))
  const path = join(directory, 'bd')
  const cases = Object.entries(values)
    .map(([key, value]) => `    ${key}) echo '${value}' ;;`)
    .join('\n')
  writeFileSync(
    path,
    `#!/bin/sh\ncase "$3" in\n${cases}\n  *) echo '' ;;\nesac\n`
  )
  chmodSync(path, 0o755)
  return path
}

afterEach(() => {
  delete process.env.BD_BIN
})

describe('readLiveSetup', () => {
  it('без export.auto следить не за чем', async () => {
    process.env.BD_BIN = fakeConfig({ 'export.auto': 'false' })

    await expect(readLiveSetup(tmpdir())).resolves.toEqual({ live: false })
  })

  it('берёт путь и частоту у bd, а не из умолчаний', async () => {
    process.env.BD_BIN = fakeConfig({
      'export.auto': 'true',
      'export.path': 'выгрузка.jsonl',
      'export.interval': '5s'
    })
    const project = mkdtempSync(join(tmpdir(), 'beadle-ws-'))

    await expect(readLiveSetup(project)).resolves.toEqual({
      live: true,
      file: join(project, '.beads', 'выгрузка.jsonl'),
      interval: '5s'
    })
  })

  it('пустой путь подменяет умолчанием, а не пустотой', async () => {
    process.env.BD_BIN = fakeConfig({ 'export.auto': 'true' })
    const project = mkdtempSync(join(tmpdir(), 'beadle-ws-'))

    const setup = await readLiveSetup(project)

    expect(setup).toMatchObject({
      file: join(project, '.beads', 'issues.jsonl')
    })
  })
})

describe('fingerprint', () => {
  it('пропавший файл — пустая строка, а не авария', async () => {
    await expect(fingerprint(join(tmpdir(), 'нет-такого'))).resolves.toBe('')
  })

  it('меняется, когда меняется файл', async () => {
    const path = join(mkdtempSync(join(tmpdir(), 'beadle-fp-')), 'issues.jsonl')
    writeFileSync(path, 'раз')
    const before = await fingerprint(path)

    writeFileSync(path, 'раз и два')
    const after = await fingerprint(path)

    expect(before).not.toBe('')
    expect(after).not.toBe(before)
  })
})
