import { z } from 'zod'

import { issueSchema } from './issue.ts'
import { workspaceSchema } from './workspace.ts'

/**
 * Формы ответов сервера. Живут в контракте, а не в клиенте: иначе фронт знает
 * о сервере по памяти автора, и расхождение обнаруживается в рантайме.
 */

/**
 * `blocked` в базе нет — он выводится из графа зависимостей на сервере.
 * Поэтому задача в ответе шире задачи в базе, и это разные схемы.
 */
export const issueViewSchema = issueSchema.extend({
  blocked: z.boolean()
})

export const issuesResponseSchema = z.object({
  workspace: workspaceSchema,
  issues: z.array(issueViewSchema)
})

export const workspacesResponseSchema = z.object({
  workspaces: z.array(workspaceSchema)
})

export type IssueView = z.infer<typeof issueViewSchema>
export type IssuesResponse = z.infer<typeof issuesResponseSchema>
export type WorkspacesResponse = z.infer<typeof workspacesResponseSchema>
