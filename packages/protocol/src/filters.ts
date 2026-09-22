import { z } from 'zod'

import { issueStatusSchema, issueTypeSchema, prioritySchema } from './issue.ts'

/**
 * Фильтры приходят из адресной строки, поэтому все поля необязательны
 * и разбираются из строк: ссылка на отфильтрованный список должна
 * открываться в том же виде у другого человека и в другой вкладке.
 */
export const issueFiltersSchema = z.object({
  status: z.array(issueStatusSchema).optional(),
  type: z.array(issueTypeSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  label: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  parent: z.string().optional(),
  search: z.string().optional()
})

export type IssueFilters = z.infer<typeof issueFiltersSchema>
