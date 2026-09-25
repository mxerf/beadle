import { useCallback, useEffect, useState } from 'react'

/** Сколько держится подтверждение: заметить успели, надоесть — ещё нет. */
const CONFIRM_MS = 1200

/**
 * Копирование в буфер с подтверждением. Общее у номера задачи и у массовых
 * кнопок списка: подтверждение везде держится одинаково и гаснет само.
 */
export function useCopy(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return undefined
    }
    const timer = setTimeout(() => setCopied(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = useCallback((text: string) => {
    // Отказ буфера молчаливый: подтверждения не будет, и это честнее,
    // чем показать «скопировано» при пустом буфере.
    void navigator.clipboard.writeText(text).then(
      () => setCopied(true),
      () => undefined
    )
  }, [])

  return { copied, copy }
}
