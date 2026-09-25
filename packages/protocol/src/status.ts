import { z } from 'zod'

import { workspaceSchema } from './workspace.ts'

/**
 * Словарь статусов одного проекта. Форма выведена из `bd statuses --json`:
 * встроенные статусы там и свои из `status.custom` приходят двумя списками,
 * а наружу отдаются одним — в порядке, в каком задача их проходит.
 */

/**
 * Категория говорит, что статус значит, — от неё зависит цвет тега и место
 * колонки. `unspecified` — свой статус, заведённый старой записью без
 * категории: `bd` его принимает, но смысла не сообщает.
 */
export const statusCategorySchema = z.enum([
  'active',
  'wip',
  'unspecified',
  'frozen',
  'done'
])

export const statusSchema = z.object({
  name: z.string(),
  category: statusCategorySchema,
  /** Заведён в конфиге проекта, а не встроен в `bd`. */
  custom: z.boolean()
})

export const statusesResponseSchema = z.object({
  workspace: workspaceSchema,
  statuses: z.array(statusSchema)
})

export type StatusCategory = z.infer<typeof statusCategorySchema>
export type Status = z.infer<typeof statusSchema>
export type StatusesResponse = z.infer<typeof statusesResponseSchema>
