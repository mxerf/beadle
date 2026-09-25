import type { Label } from '@beadle/protocol'
import { z } from 'zod'

import { BdError, runBdJson } from './bd.ts'

/**
 * Лейблы проекта спрашиваются у `bd`, а не собираются по списку задач:
 * панели фильтров нужен весь проект, а список под фильтром видит только
 * отобранное — и прятал бы лейблы, по которым ещё не отбирали.
 */

const bdLabelsSchema = z.array(
  z.object({ label: z.string(), count: z.number().int() })
)

export async function readLabels(cwd: string): Promise<Label[]> {
  const args = ['label', 'list-all', '--json']
  const parsed = bdLabelsSchema.safeParse(await runBdJson(cwd, args))
  if (!parsed.success) {
    throw new BdError(
      `bd ${args.join(' ')} ответил не списком лейблов`,
      cwd,
      args
    )
  }
  return parsed.data.map(({ label, count }) => ({ name: label, count }))
}
