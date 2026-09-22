import { z } from 'zod'

import { issueSchema } from './issue.ts'
import { workspaceSchema } from './workspace.ts'

/**
 * Формы ответов сервера. Живут в контракте, а не в клиенте: иначе фронт знает
 * о сервере по памяти автора, и расхождение обнаруживается в рантайме.
 */

/**
 * Задача в ответе шире задачи в базе: два поля выводятся из целого набора,
 * а не хранятся. `blocked_by` собирается по графу зависимостей,
 * `parent_title` берётся у родителя. Оба нужны экрану, и оба может дать
 * только тот, у кого набор есть целиком: под фильтром ни держателя,
 * ни родителя в ответе может не оказаться.
 *
 * Держатели списком, а не признаком «заблокирована»: «да» отвечает на
 * вопрос, который человек задаёт вторым, — первым он спрашивает «кем».
 * Признак из списка выводится, список из признака — нет.
 */
export const issueViewSchema = issueSchema.extend({
  blocked_by: z.array(z.string()).default([]),
  parent_title: z.string().optional()
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

/**
 * Отказ сервера. Адрес в этом проекте — источник истины о состоянии экрана,
 * поэтому нераспознанный фильтр не выбрасывается молча: показать доску,
 * проигнорировав часть адреса, значит соврать человеку о том, что он видит.
 * Ответ называет поле и причину — ссылки живут в закладках и переписке,
 * а словарь статусов задаёт beads и может его переименовать.
 */
export const filterProblemSchema = z.object({
  /** Путь к значению в фильтрах: `status`, `priority.0`. */
  path: z.string(),
  message: z.string()
})

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  fields: z.array(filterProblemSchema).optional()
})

export type FilterProblem = z.infer<typeof filterProblemSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>

/**
 * Состояние живого обновления. `bd` выкладывает выгрузку задач в файл
 * только при включённом `export.auto`, и не чаще, чем раз в `export.interval`.
 * Поэтому и то и другое едет на экран: молчащая страница должна уметь
 * объяснить, почему она молчит, — иначе человек решит, что всё сломалось.
 */
export const liveStatusSchema = z.object({
  live: z.boolean(),
  /** Как часто `bd` обновляет выгрузку, его же словами: `60s`. */
  interval: z.string().optional()
})

export type LiveStatus = z.infer<typeof liveStatusSchema>
