import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join, resolve } from 'node:path'

import type { Workspace } from '@beadle/protocol'

/**
 * Реестр воркспейсов — список путей в файле, а не состояние процесса.
 * Регистрация в памяти (как у beads-ui) не переживает перезапуск, и после
 * перезагрузки машины проекты приходится добавлять заново.
 */

const CONFIG_DIR = join(homedir(), '.config', 'beadle')
const CONFIG_FILE = join(CONFIG_DIR, 'workspaces.json')

/**
 * Адрес обязан пережить переименование папки и не зависеть от порядка
 * регистрации, поэтому slug — имя каталога плюс шесть символов от хеша пути:
 * читается человеком, но не сталкивается у двух одноимённых проектов.
 */
export function slugFor(path: string): string {
  const digest = createHash('sha256').update(path).digest('hex').slice(0, 6)
  return `${basename(path)}-${digest}`
}

function toWorkspace(path: string): Workspace {
  return { slug: slugFor(path), name: basename(path), path }
}

function readPaths(): string[] {
  if (!existsSync(CONFIG_FILE)) {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'))
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

function writePaths(paths: readonly string[]): void {
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_FILE, `${JSON.stringify(paths, null, 2)}\n`, 'utf8')
}

/** Проект годится, только если в нём есть база: пустой путь в списке — мусор. */
export function hasBeadsDatabase(path: string): boolean {
  return existsSync(join(path, '.beads'))
}

export function listWorkspaces(): Workspace[] {
  return readPaths().filter(hasBeadsDatabase).map(toWorkspace)
}

export function findWorkspace(slug: string): Workspace | undefined {
  return listWorkspaces().find((workspace) => workspace.slug === slug)
}

/**
 * Добавляет проект в реестр. Повторное добавление не дублирует запись
 * и не является ошибкой: команда вызывается из каталога проекта и должна
 * быть безопасна для повторного запуска.
 */
export function addWorkspace(rawPath: string): Workspace {
  const path = resolve(rawPath)
  if (!hasBeadsDatabase(path)) {
    throw new Error(`в ${path} нет каталога .beads — это не проект beads`)
  }

  const paths = readPaths()
  if (!paths.includes(path)) {
    writePaths([...paths, path])
  }
  return toWorkspace(path)
}

export function removeWorkspace(rawPath: string): void {
  const path = resolve(rawPath)
  writePaths(readPaths().filter((item) => item !== path))
}
