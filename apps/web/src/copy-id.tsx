import { useEffect, useState } from 'react'

import { copy } from './copy-id.css.ts'

/** Сколько держится подтверждение: заметить успели, надоесть — ещё нет. */
const CONFIRM_MS = 1200

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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return undefined
    }
    const timer = setTimeout(() => setCopied(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      className={
        className
          ? `${copy[copied ? 'copied' : 'plain']} ${className}`
          : copy[copied ? 'copied' : 'plain']
      }
      // Заголовок, а не подпись рядом: подсказка нужна один раз, а место
      // в строке занимала бы всегда.
      title={copied ? 'Номер скопирован' : 'Скопировать номер'}
      onClick={() => {
        // Отказ буфера молчаливый: подтверждения не будет, и это честнее,
        // чем показать «скопировано» при пустом буфере.
        void navigator.clipboard.writeText(id).then(
          () => setCopied(true),
          () => undefined
        )
      }}
    >
      {id}
    </button>
  )
}
