import { stat } from 'node:fs/promises'
import { join } from 'node:path'

import { runBdText } from './bd.ts'

/**
 * Как заметить, что задачи изменились.
 *
 * Спрашивать `bd` по кругу нельзя: один вызов на живой базе — четверть
 * секунды, и это четверть секунды на каждую открытую вкладку. Следить за
 * каталогом `.beads` целиком — тоже: замеры на двух бэкендах показали, что
 * обычное чтение трогает там файлы (у встроенного Dolt — журнал, у сервера —
 * `last-touched`), и наш же запрос поднял бы новую тревогу. Вышла бы петля.
 *
 * Единственное, что меняется ровно на записи и никогда на чтении, — выгрузка
 * `issues.jsonl`. Её `bd` кладёт рядом сам, если в проекте включён
 * `export.auto`; в конфиге про неё прямо сказано «for viewers», и beadle
 * как раз viewer. Мы её не открываем и не разбираем — берём только время
 * и размер: содержимое по-прежнему спрашивается у `bd`.
 */

export type LiveSetup =
  | { live: true; file: string; interval: string }
  | { live: false }

const DEFAULT_EXPORT = 'issues.jsonl'

/**
 * Настройки берутся у самого `bd`, а не из его конфига глазами: путь
 * выгрузки настраиваемый, и угадывать его по умолчанию значит однажды
 * молча следить не за тем файлом.
 */
export async function readLiveSetup(cwd: string): Promise<LiveSetup> {
  const auto = await runBdText(cwd, ['config', 'get', 'export.auto'])
  if (auto !== 'true') {
    return { live: false }
  }

  const path = await runBdText(cwd, ['config', 'get', 'export.path'])
  const interval = await runBdText(cwd, ['config', 'get', 'export.interval'])

  return {
    live: true,
    file: join(cwd, '.beads', path || DEFAULT_EXPORT),
    interval
  }
}

/**
 * Отпечаток выгрузки: время изменения и размер. Пропавший файл — пустая
 * строка, а не авария: выгрузки может не быть до первой записи.
 */
export async function fingerprint(file: string): Promise<string> {
  try {
    const info = await stat(file)
    return `${info.mtimeMs}:${info.size}`
  } catch {
    return ''
  }
}
