import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

/**
 * Единственное место, где запускается `bd`. Прямых обращений к базе нет
 * намеренно: beads держит истину в Dolt, схема меняется между версиями,
 * и чтение в обход CLI ломается на первом же обновлении трекера.
 */

/** Вывод на 467 задачах — 1.76 МБ; берём запас, но не безлимит. */
const MAX_OUTPUT_BYTES = 64 * 1024 * 1024

/** Живой `bd` отвечает за 0.4 с; всё, что дольше десяти, — уже авария. */
const TIMEOUT_MS = 10_000

export class BdError extends Error {
  constructor(
    message: string,
    readonly cwd: string,
    readonly args: readonly string[]
  ) {
    super(message)
    this.name = 'BdError'
  }
}

/**
 * С флагом `--json` промах `bd` объясняет в самом ответе — `{"error": …}` —
 * и при этом выходит с ненулевым кодом. Такой выход не авария процесса,
 * а ответ: несуществующий номер задачи должен стать 404, а не 502.
 */
function jsonFromFailure(cause: unknown): string | undefined {
  if (typeof cause !== 'object' || cause === null) {
    return undefined
  }
  const { stdout } = cause as { stdout?: unknown }
  if (typeof stdout !== 'string') {
    return undefined
  }
  const trimmed = stdout.trim()
  return trimmed.startsWith('{') || trimmed.startsWith('[') ? stdout : undefined
}

/**
 * Запускает `bd` в каталоге проекта и отдаёт его вывод.
 *
 * @param cwd Корень воркспейса — от него `bd` находит свой `.beads`.
 * @param args Аргументы команды без имени бинаря.
 */
async function runBd(cwd: string, args: readonly string[]): Promise<string> {
  const binary = process.env.BD_BIN ?? 'bd'

  let stdout: string
  try {
    const result = await run(binary, [...args], {
      cwd,
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES,
      encoding: 'utf8'
    })
    stdout = result.stdout
  } catch (cause) {
    const answered = jsonFromFailure(cause)
    if (answered === undefined) {
      const reason = cause instanceof Error ? cause.message : String(cause)
      throw new BdError(
        `bd ${args.join(' ')} не отработал: ${reason}`,
        cwd,
        args
      )
    }
    stdout = answered
  }

  return stdout
}

export async function runBdJson(
  cwd: string,
  args: readonly string[]
): Promise<unknown> {
  const stdout = await runBd(cwd, args)

  try {
    return JSON.parse(stdout)
  } catch {
    throw new BdError(
      `bd ${args.join(' ')} вернул не JSON (${stdout.length} байт)`,
      cwd,
      args
    )
  }
}

/** Односложный ответ `bd`: настройки проекта отдаются простой строкой. */
export async function runBdText(
  cwd: string,
  args: readonly string[]
): Promise<string> {
  return (await runBd(cwd, args)).trim()
}
