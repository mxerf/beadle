import { useCopy } from './clipboard.ts'
import { copy as styles } from './copy-id.css.ts'

/**
 * Номер задачи, который копируется нажатием. Стоит во всех видах, где
 * виден номер: из списка его уносят в терминал к `bd`, и выделять мышью
 * строку, которая при этом ещё и ссылка, — мучение.
 */
export function CopyId({
  id,
  className
}: {
  id: string
  className?: string | undefined
}) {
  const { copied, copy } = useCopy()

  return (
    <button
      type="button"
      className={
        className
          ? `${styles[copied ? 'copied' : 'plain']} ${className}`
          : styles[copied ? 'copied' : 'plain']
      }
      // Заголовок, а не подпись рядом: подсказка нужна один раз, а место
      // в строке занимала бы всегда.
      title={copied ? 'Номер скопирован' : 'Скопировать номер'}
      onClick={() => copy(id)}
    >
      {id}
    </button>
  )
}
