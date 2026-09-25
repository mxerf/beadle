import { z } from 'zod'

import { workspaceSchema } from './workspace.ts'

/**
 * Лейблы проекта со счётом задач. Форма выведена из `bd label list-all
 * --json`; счёт идёт по всему проекту, включая закрытые, — по нему
 * панель фильтров решает, что показать сразу, а что убрать за «ещё».
 */
export const labelSchema = z.object({
  name: z.string(),
  count: z.number().int()
})

export const labelsResponseSchema = z.object({
  workspace: workspaceSchema,
  labels: z.array(labelSchema)
})

export type Label = z.infer<typeof labelSchema>
export type LabelsResponse = z.infer<typeof labelsResponseSchema>
