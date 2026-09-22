import { z } from 'zod'

import { issueStatusSchema, issueTypeSchema, prioritySchema } from './issue.ts'

/**
 * Фильтры приходят из адресной строки, поэтому все поля необязательны
 * и разбираются из строк: ссылка на отфильтрованный список должна
 * открываться в том же виде у другого человека и в другой вкладке.
 */
/**
 * Флаг в адресе пишется словом, а не присутствием: `?ready=0` обязан
 * означать «нет», а не «да». Непонятое значение — отказ, как и у остальных
 * фильтров.
 */
const flag = z
  .enum(['1', '0', 'true', 'false'])
  .transform((value) => value === '1' || value === 'true')
  .optional()

export const issueFiltersSchema = z.object({
  status: z.array(issueStatusSchema).optional(),
  type: z.array(issueTypeSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  label: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  parent: z.string().optional(),
  search: z.string().optional(),
  /** Открыта, не отложена и никем не держится — то, что можно брать. */
  ready: flag
})

export type IssueFilters = z.infer<typeof issueFiltersSchema>
