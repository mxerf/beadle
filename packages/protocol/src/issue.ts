import { z } from 'zod'

/**
 * Форма задачи выведена из вывода `bd list --json` на живой базе (467 задач),
 * а не из документации: документация отстаёт, а поле, которого не оказалось
 * в данных, стоит дороже отсутствующего.
 */

/**
 * Статус — строка, а не перечисление: сверх встроенных `bd` принимает
 * статусы, заведённые в `status.custom` самого проекта. Закрытый список
 * молча терял такие задачи — и из списка, и со страницы задачи. Какие
 * строки допустимы, говорит словарь проекта (`status.ts`), а не контракт.
 */
export const issueStatusSchema = z.string().min(1)

export const issueTypeSchema = z.enum([
  'task',
  'bug',
  'feature',
  'epic',
  'chore',
  'decision',
  'story',
  'spike',
  'milestone'
])

/**
 * Приоритет приходит числом 0–4 и показывается как P0–P4. Строковая форма
 * не заводится: одно представление в контракте, перевод — в слое показа.
 */
export const prioritySchema = z.number().int().min(0).max(4)

export const dependencyTypeSchema = z.enum([
  'parent-child',
  'blocks',
  'related',
  'relates-to',
  'discovered-from',
  'supersedes'
])

export const dependencySchema = z.object({
  issue_id: z.string(),
  depends_on_id: z.string(),
  type: dependencyTypeSchema,
  created_at: z.string(),
  created_by: z.string()
})

/**
 * Пустая строка вместо отсутствия — то, как `bd` отдаёт незаполненные поля.
 * Приводим к undefined на границе, чтобы дальше по коду не сравнивать с ''.
 */
const blankAsUndefined = z
  .string()
  .transform((value) => (value === '' ? undefined : value))
  .optional()

export const issueSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: issueStatusSchema,
  issue_type: issueTypeSchema,
  priority: prioritySchema,

  description: blankAsUndefined,
  design: blankAsUndefined,
  notes: blankAsUndefined,
  acceptance_criteria: blankAsUndefined,
  close_reason: blankAsUndefined,

  owner: blankAsUndefined,
  assignee: blankAsUndefined,
  created_by: blankAsUndefined,
  parent: blankAsUndefined,

  created_at: z.string(),
  updated_at: z.string(),
  started_at: blankAsUndefined,
  closed_at: blankAsUndefined,
  due_at: blankAsUndefined,

  labels: z.array(z.string()).default([]),
  dependencies: z.array(dependencySchema).default([]),
  dependency_count: z.number().int().default(0),
  dependent_count: z.number().int().default(0),
  comment_count: z.number().int().default(0),
  estimated_minutes: z.number().int().optional()
})

export type Issue = z.infer<typeof issueSchema>
export type IssueStatus = z.infer<typeof issueStatusSchema>
export type IssueType = z.infer<typeof issueTypeSchema>
export type Dependency = z.infer<typeof dependencySchema>
export type DependencyType = z.infer<typeof dependencyTypeSchema>
