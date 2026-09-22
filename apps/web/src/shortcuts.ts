import { useEffect, useRef } from 'react'

/**
 * Горячие клавиши читалки.
 *
 * Клавиша опознаётся по коду, а не по символу: раскладка здесь русская
 * не реже английской, и `event.key` на ней отдаёт «о» вместо `j`. Код
 * привязан к месту клавиши на клавиатуре и от раскладки не зависит —
 * человек жмёт туда же, куда жал бы в английской.
 */
export type Shortcuts = {
  /** Перейти к виду по его месту в переключателе. */
  onView: (index: number) => void
  onSearch: () => void
  onRefresh: () => void
  onHelp: () => void
  onEscape: () => void
}

const VIEW_CODES = ['Digit1', 'Digit2', 'Digit3', 'Digit4']

export function useShortcuts(handlers: Shortcuts): void {
  const latest = useRef(handlers)

  // Обработчик вешается один раз, а свежие действия достаёт из ссылки:
  // иначе он пересоздавался бы на каждый ввод буквы в поиске.
  useEffect(() => {
    latest.current = handlers
  })

  useEffect(() => {
    function handle(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      // «Уйти» работает и из поля ввода: это выход, а не команда. Из поля
      // он ещё и снимает фокус — иначе после `/` клавиши остаются буквами
      // и вернуться к ним можно только мышью.
      if (event.key === 'Escape') {
        if (event.target instanceof HTMLElement && isTyping(event.target)) {
          event.target.blur()
        }
        latest.current.onEscape()
        return
      }
      if (isTyping(event.target)) {
        return
      }

      const view = VIEW_CODES.indexOf(event.code)
      if (view !== -1) {
        event.preventDefault()
        latest.current.onView(view)
        return
      }

      switch (event.code) {
        case 'Slash': {
          event.preventDefault()
          if (event.shiftKey) {
            latest.current.onHelp()
          } else {
            latest.current.onSearch()
          }
          return
        }
        case 'KeyR': {
          event.preventDefault()
          latest.current.onRefresh()
          return
        }
        case 'KeyJ': {
          event.preventDefault()
          moveFocus(1)
          return
        }
        case 'KeyK': {
          event.preventDefault()
          moveFocus(-1)
          return
        }
        default: {
          return
        }
      }
    }

    document.addEventListener('keydown', handle)
    return () => {
      document.removeEventListener('keydown', handle)
    }
  }, [])
}

/** Печатает ли человек прямо сейчас: тогда буквы — это текст, а не команды. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

/**
 * Соседняя задача в любом виде. Переставляется настоящий фокус, а не своя
 * подсветка: строки и карточки уже ссылки, поэтому `Enter` открывает их
 * без единой строчки кода, а кольцо фокуса рисуется тем же правилом,
 * что и при обходе табом.
 */
function moveFocus(step: number): void {
  const rows = [...document.querySelectorAll<HTMLElement>('[data-issue-row]')]
  if (rows.length === 0) {
    return
  }

  const current = rows.findIndex((row) => row === document.activeElement)
  const next =
    current === -1 ? (step > 0 ? 0 : rows.length - 1) : current + step
  const target = rows[Math.min(Math.max(next, 0), rows.length - 1)]

  target?.focus()
  target?.scrollIntoView({ block: 'nearest' })
}
