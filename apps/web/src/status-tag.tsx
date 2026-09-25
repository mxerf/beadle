import { statusCaption, statusTone } from './captions.ts'
import { useStatuses } from './statuses.ts'
import * as tag from './tag.css.ts'

/**
 * Тег статуса — один на все виды. Цвет зависит от категории, а она есть
 * только в словаре проекта, поэтому тег сам знает, где его взять.
 */
export function StatusTag({ status }: { status: string }) {
  const category = useStatuses().find((one) => one.name === status)?.category

  return (
    <span className={tag.tone[statusTone(category)]}>
      {statusCaption(status)}
    </span>
  )
}
