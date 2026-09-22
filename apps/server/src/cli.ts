import { serve } from '@hono/node-server'

import { createApp, type WebHandler } from './app.ts'
import { addWorkspace, hasBeadsDatabase, listWorkspaces } from './workspaces.ts'

/**
 * Весь CLI. Команд три, поэтому разбор аргументов живёт здесь: отдельный
 * слой парсинга на трёх ветках — бюрократия, а не порядок.
 *
 * Отсюда же запускается сервер. Собранный фронт передаётся аргументом,
 * а не берётся из файлов рядом: в одном бинаре он вшит внутрь, а в разработке
 * его раздаёт vite, и знать про этот выбор должен тот, кто собирает.
 */

const DEFAULT_PORT = 4200

function readPort(argv: readonly string[]): number {
  const flagIndex = argv.indexOf('--port')
  const fromFlag = flagIndex >= 0 ? argv[flagIndex + 1] : undefined
  const raw = fromFlag ?? process.env['PORT']
  const parsed = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(parsed) ? parsed : DEFAULT_PORT
}

function readHost(argv: readonly string[]): string {
  const flagIndex = argv.indexOf('--host')
  const fromFlag = flagIndex >= 0 ? argv[flagIndex + 1] : undefined
  return fromFlag ?? process.env['HOST'] ?? '127.0.0.1'
}

export function main(argv: readonly string[], web?: WebHandler): void {
  const command = argv[0]

  if (command === 'add') {
    const workspace = addWorkspace(argv[1] ?? process.cwd())
    console.log(`добавлен ${workspace.name} (${workspace.slug})`)
    return
  }

  if (command === 'list') {
    for (const workspace of listWorkspaces()) {
      console.log(`${workspace.slug}\t${workspace.path}`)
    }
    return
  }

  // Запуск из каталога проекта добавляет его сам: иначе первое знакомство
  // с инструментом начинается с чтения справки, а не с доски.
  const cwd = process.cwd()
  if (hasBeadsDatabase(cwd)) {
    addWorkspace(cwd)
  }

  const port = readPort(argv)
  const hostname = readHost(argv)

  serve({ fetch: createApp(web).fetch, port, hostname }, (info) => {
    console.log(`beadle   http://${hostname}:${info.port}`)
    console.log(`проектов ${listWorkspaces().length}`)
  })
}
