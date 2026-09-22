import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * Сборка одного исполняемого файла: сервер и собранный фронт внутри него.
 *
 * Фронт вшивается импортами `with { type: 'file' }` — только их видит
 * сборщик `bun`, и только они кладут файл внутрь бинаря. Имена в сборке
 * хешированные и заранее неизвестны, поэтому список импортов не пишется
 * руками, а собирается здесь по готовой сборке.
 */

const ROOT = join(import.meta.dirname, '..')
const DIST = join(ROOT, 'apps', 'web', 'dist')
const BUILD = join(ROOT, 'build')

/**
 * `--target` и `--outfile` нужны сборке на стороне: `bun` умеет собирать
 * под чужую платформу с любой, поэтому все бинари выпуска делаются одним
 * раннером, а не матрицей из четырёх операционных систем.
 */
function flag(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`)
  return at === -1 ? undefined : process.argv[at + 1]
}

const TARGET = flag('target')
const BINARY = flag('outfile') ?? join(ROOT, 'beadle')

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collect(path) : [path]
  })
}

/** Путь в адресе — от корня сборки: именно так на файлы ссылается страница. */
function toUrlPath(path: string): string {
  return `/${relative(DIST, path).split('\\').join('/')}`
}

function writeEmbed(files: readonly string[]): void {
  const imports = files.map(
    (path, index) =>
      `import file${index} from '${relative(BUILD, path).split('\\').join('/')}' with { type: 'file' }`
  )
  const entries = files.map(
    (path, index) => `  ['${toUrlPath(path)}', file${index}]`
  )

  writeFileSync(
    join(BUILD, 'embed.ts'),
    `// Собран scripts/build-binary.ts по готовой сборке фронта.
// Править руками бесполезно: файл переписывается на каждой сборке.
${imports.join('\n')}

const FILES: ReadonlyMap<string, string> = new Map([
${entries.join(',\n')}
])

function send(embedded: string): Response {
  const file = Bun.file(embedded)
  // Тип проставляется явно: без него ответ уезжает как text/plain, и браузер
  // отказывается исполнять модуль — страница остаётся белой без единой ошибки
  // на сервере.
  return new Response(file, { headers: { 'content-type': file.type } })
}

export function openWeb(pathname: string): Response | undefined {
  const exact = FILES.get(pathname)
  if (exact !== undefined) {
    return send(exact)
  }

  // Промах по файлу сборки — это промах, а не маршрут приложения:
  // отдать вместо картинки страницу значит спрятать опечатку в ссылке.
  if (pathname.startsWith('/assets/')) {
    return undefined
  }

  const index = FILES.get('/index.html')
  return index === undefined ? undefined : send(index)
}
`
  )
}

function writeEntry(): void {
  writeFileSync(
    join(BUILD, 'entry.ts'),
    `// Собран scripts/build-binary.ts.
import { main } from '../apps/server/src/cli.ts'

import { openWeb } from './embed.ts'

main(process.argv.slice(2), openWeb)
`
  )
}

const files = collect(DIST)
if (files.length === 0) {
  throw new Error(`в ${DIST} пусто — сначала соберите фронт`)
}

rmSync(BUILD, { recursive: true, force: true })
mkdirSync(BUILD, { recursive: true })
writeEmbed(files)
writeEntry()

execFileSync(
  'bun',
  [
    'build',
    '--compile',
    ...(TARGET === undefined ? [] : ['--target', TARGET]),
    '--outfile',
    BINARY,
    join(BUILD, 'entry.ts')
  ],
  { cwd: ROOT, stdio: 'inherit' }
)

console.log(`\nвшито файлов фронта: ${files.length}`)
console.log(`бинарь: ${BINARY}${TARGET === undefined ? '' : ` (${TARGET})`}`)
