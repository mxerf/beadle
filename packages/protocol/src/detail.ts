import { z } from 'zod'

import {
  dependencyTypeSchema,
  issueSchema,
  issueStatusSchema,
  issueTypeSchema,
  prioritySchema
} from './issue.ts'
import { workspaceSchema } from './workspace.ts'

/**
 * Подробности одной задачи. Форма выведена из живого вывода
 * `bd show <id> --json --include-comments --include-dependents`, и она
 * не совпадает со списком: там `dependencies` — это рёбра графа, здесь —
 * сами задачи на другом конце ребра, с типом связи внутри.
 */

/** Соседняя задача: столько, сколько нужно строке в списке связей. */
export const issueLinkSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: issueStatusSchema,
  issue_type: issueTypeSchema,
  priority: prioritySchema,
  /** Чем связана: родитель, блокировка, просто упоминание. */
  dependency_type: dependencyTypeSchema.optional()
})

export const commentSchema = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  created_at: z.string()
})

export const issueDetailSchema = issueSchema
  .omit({ dependencies: true })
  .extend({
    /** Задачи, которых ждёт эта: родитель и блокирующие. */
    dependencies: z.array(issueLinkSchema).default([]),
    /** Задачи, которые ждут её: подзадачи и заблокированные ею. */
    dependents: z.array(issueLinkSchema).default([]),
    comments: z.array(commentSchema).default([]),

    /**
     * Счёт детей эпика считает сам `bd`. Свой расчёт по дереву остаётся
     * на странице эпиков, где дерево уже собрано; здесь берётся готовое.
     */
    epic_total_children: z.number().int().optional(),
    epic_closed_children: z.number().int().optional()
  })

export const issueDetailResponseSchema = z.object({
  workspace: workspaceSchema,
  issue: issueDetailSchema
})

export type IssueLink = z.infer<typeof issueLinkSchema>
export type Comment = z.infer<typeof commentSchema>
export type IssueDetail = z.infer<typeof issueDetailSchema>
export type IssueDetailResponse = z.infer<typeof issueDetailResponseSchema>
