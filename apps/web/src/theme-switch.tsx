import { useEffect, useState } from 'react'

import { themeSwitch } from './theme-switch.css.ts'

type Theme = 'light' | 'dark'

/**
 * Тема — вкус смотрящего, а не состояние экрана, поэтому она живёт
 * в браузере, а не в адресе: ссылка, отправленная из тёмной комнаты,
 * не должна перекрашивать экран получателю.
 *
 * Тот же ключ читает скрипт в `index.html` — он ставит тему до первого
 * кадра, иначе выбранная тёмная мигала бы светлой, пока грузится приложение.
 */
const STORAGE_KEY = 'beadle-theme'

const SYSTEM_DARK = '(prefers-color-scheme: dark)'

/**
 * Кнопка переключает на противоположную той, что видна. Отдельной позиции
 * «как в системе» у неё нет, и она не нужна: выбор, совпавший с системой,
 * не запоминается, и страница снова следует системе сама.
 */
export function ThemeSwitch() {
  const [theme, setTheme] = useState(shownTheme)

  // Пока выбора нет, система может смениться без нас — например, вечером
  // по расписанию. Цвета CSS переключит сам, а значок надо догнать.
  useEffect(() => {
    const query = window.matchMedia(SYSTEM_DARK)
    const follow = () => setTheme(shownTheme())
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [])

  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = next === 'dark' ? 'Тёмная тема' : 'Светлая тема'

  return (
    <button
      type="button"
      className={themeSwitch}
      title={label}
      aria-label={label}
      onClick={() => {
        choose(next)
        setTheme(next)
      }}
    >
      {next === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

/** Истина — то, что стоит на странице, а не то, что лежит в хранилище. */
function shownTheme(): Theme {
  const chosen = document.documentElement.dataset.theme
  return chosen === 'light' || chosen === 'dark' ? chosen : systemTheme()
}

function systemTheme(): Theme {
  return window.matchMedia(SYSTEM_DARK).matches ? 'dark' : 'light'
}

function choose(theme: Theme): void {
  const root = document.documentElement
  const followsSystem = theme === systemTheme()

  if (followsSystem) {
    delete root.dataset.theme
  } else {
    root.dataset.theme = theme
  }

  // Хранилища может не быть (приватное окно, запрет сайта). Тогда выбор
  // продержится до перезагрузки — это деградация, а не повод для ошибки.
  try {
    if (followsSystem) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  } catch {
    // Сообщать нечего: экран уже перекрашен.
  }
}

function MoonIcon() {
  return (
    <svg {...ICON}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

const ICON = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
} as const
