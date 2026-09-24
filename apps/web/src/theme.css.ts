import {
  assignVars,
  createGlobalTheme,
  globalStyle
} from '@vanilla-extract/css'

/**
 * Токены дизайн-системы «тёплая бумага», перенесённые из внутренней
 * дизайн-системы соседнего проекта. Три её правила держатся и здесь:
 *
 * 1. Поверхности непрозрачные и различаются тоном, а не рамкой и тенью.
 *    Волосяная линия допустима только как разделитель.
 * 2. Все углы — суперэллипса, а не круглая дуга.
 * 3. Наведение меняет цвет подложки, нажатие — масштаб. Прозрачностью
 *    состояние не показывается.
 */
const lightColor = {
  /** Полотно страницы. */
  paper: 'oklch(0.955 0.006 80)',
  /** Лист под потоком карточек. */
  surface: 'oklch(0.978 0.004 80)',
  /** Карточка — самый светлый уровень. */
  card: 'oklch(1 0.001 80)',

  /** Подложка контролов и её состояние под курсором. */
  tone: 'oklch(0.93 0.007 80)',
  toneStrong: 'oklch(0.9 0.008 80)',
  /** Подсветка строки под курсором: на шаг глубже карточки. */
  toneSoft: 'oklch(0.948 0.006 80)',

  text: 'oklch(0.25 0 0)',
  muted: 'oklch(0.55 0.006 80)',
  faint: 'oklch(0.7 0.006 80)',
  line: 'oklch(0.89 0.006 80)',

  primary: 'oklch(0.6 0.13 163)',
  primarySoft: 'oklch(0.6 0.13 163 / 13%)',
  primarySoftStrong: 'oklch(0.6 0.13 163 / 20%)',
  ring: 'oklch(0.6 0.13 163 / 45%)',

  warning: 'oklch(0.66 0.15 70)',
  warningSoft: 'oklch(0.8 0.14 80 / 22%)',
  danger: 'oklch(0.6 0.2 25)',
  dangerSoft: 'oklch(0.65 0.2 25 / 13%)',
  info: 'oklch(0.6 0.15 235)',
  infoSoft: 'oklch(0.65 0.15 235 / 14%)',

  /**
   * Тёмный остров: третье правило системы — то, что всплывает над
   * содержимым, берёт обратный контраст, а не полупрозрачную подложку.
   */
  island: 'oklch(0.25 0.01 80)',
  islandText: 'oklch(0.97 0.004 80)',
  islandFaint: 'oklch(0.72 0.008 80)'
}

/**
 * Тёмная палитра взята из той же системы, а не получена переворотом
 * светлой. Лестница поверхностей не переворачивается: полотно по-прежнему
 * глубже всех, карточка выше всех, просто вся лестница ушла вниз. Акцент
 * и семантика светлее и насыщеннее: исходные на тёмном тонут.
 */
const darkColor = {
  paper: 'oklch(0.155 0.004 60)',
  surface: 'oklch(0.2 0.005 60)',
  card: 'oklch(0.238 0.006 60)',

  tone: 'oklch(0.285 0.006 60)',
  toneStrong: 'oklch(0.335 0.007 60)',
  /*
   * Своё значение, а не системное: там подсветка строки ярче подложки
   * контролов, и наведение на карточку проекта кричало бы громче кнопок.
   * Здесь она, как и в светлой, на шаг от карточки.
   */
  toneSoft: 'oklch(0.265 0.006 60)',

  text: 'oklch(0.95 0.006 60)',
  muted: 'oklch(0.7 0.008 60)',
  faint: 'oklch(0.5 0.008 60)',
  line: 'oklch(0.45 0.008 60 / 35%)',

  primary: 'oklch(0.72 0.15 163)',
  primarySoft: 'oklch(0.72 0.15 163 / 16%)',
  primarySoftStrong: 'oklch(0.72 0.15 163 / 24%)',
  ring: 'oklch(0.72 0.15 163 / 45%)',

  warning: 'oklch(0.8 0.14 80)',
  warningSoft: 'oklch(0.8 0.14 80 / 18%)',
  danger: 'oklch(0.7 0.18 25)',
  dangerSoft: 'oklch(0.7 0.18 25 / 16%)',
  info: 'oklch(0.72 0.14 235)',
  infoSoft: 'oklch(0.72 0.14 235 / 16%)',

  /**
   * На тёмном полотне обратный контраст дал бы светлое пятно. Остров
   * остаётся островом иначе: он приподнят над полотном и карточками.
   */
  island: 'oklch(0.29 0.007 60)',
  islandText: 'oklch(0.95 0.006 60)',
  islandFaint: 'oklch(0.7 0.008 60)'
} satisfies Record<keyof typeof lightColor, string>

/**
 * Приподнятая поверхность, лежащая на листе, — не парящая панель.
 * Значения взяты из `--shadow-raise` дизайн-системы без усиления: тень
 * здесь обозначает подъём, а не изображает высоту.
 */
const lightShadow = {
  raise:
    '0 1px 2px oklch(0.25 0.01 80 / 4%), 0 4px 10px oklch(0.25 0.01 80 / 4%)'
}

/** На тёмном тень в четыре процента не видна вовсе — плотность системная. */
const darkShadow = {
  raise: '0 1px 2px oklch(0 0 0 / 24%), 0 4px 10px oklch(0 0 0 / 18%)'
} satisfies typeof lightShadow

export const vars = createGlobalTheme(':root', {
  color: lightColor,
  space: {
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '24px',
    '6': '32px'
  },
  /** База скруглений — 16px, как в системе; крупные поверхности берут lg. */
  radius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
    pill: '999px'
  },
  /**
   * Форма угла всей системы. Больше показатель — плотнее угол; `round`
   * вернёт обычную дугу.
   */
  shape: { corner: 'superellipse(2.4)' },
  /**
   * Смена цвета и нажатие — мгновенные (`quick`). Подъём строки идёт
   * пружиной: кривая посчитана как затухающий осциллятор (ζ=0.55, ω=12),
   * перелёт 12% и один мягкий качок. `linear()` описывает её точками —
   * обычной кубической безье такое не выразить.
   */
  motion: {
    quick: '150ms',
    spring: '360ms',
    springEase:
      'linear(0, 0.103, 0.331, 0.589, 0.815, 0.98, 1.079, 1.122, 1.123, 1.101, 1.069, 1.038, 1.012, 0.996, 0.987, 0.984, 0.986, 0.989, 0.993, 0.997, 1, 1.001, 1.002, 1.002, 1)'
  },
  shadow: lightShadow,
  text: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    lg: '18px',
    xl: '26px'
  },
  font: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace'
  }
})

/**
 * Тёмная тема включается двумя путями. Пока человек ничего не выбрал, она
 * следует системе, и это чистый CSS: первый кадр уже нужного цвета, без
 * ожидания скрипта. Выбор кнопкой ставит `data-theme` на `<html>` и
 * перебивает систему в обе стороны (см. `theme-switch.tsx`).
 *
 * `color-scheme` — ради того, что рисует сам браузер: полос прокрутки,
 * полей ввода, автозаполнения. Без него на тёмной странице они светлые.
 */
const dark = {
  vars: {
    ...assignVars(vars.color, darkColor),
    ...assignVars(vars.shadow, darkShadow)
  },
  colorScheme: 'dark'
} as const

globalStyle(':root[data-theme="dark"]', dark)

globalStyle(':root:not([data-theme="light"])', {
  '@media': { '(prefers-color-scheme: dark)': dark }
})

/**
 * Телефон — не «узкий монитор». Там нет курсора, а значит и наведения:
 * `:hover` на касании залипает после нажатия, и строка остаётся поднятой,
 * пока не тронешь другую. Поэтому подъём включается только там, где курсор
 * есть на самом деле.
 */
export const media = {
  phone: 'screen and (max-width: 640px)',
  hover: '(hover: hover)'
} as const

/** Нажатие отзывается масштабом — это основной отклик системы. */
export const press = {
  transition: `background-color ${vars.motion.quick} ease, color ${vars.motion.quick} ease, scale ${vars.motion.quick} ease`,
  selectors: {
    '&:active': { scale: '0.98' }
  }
} as const

/**
 * Подъём под курсором: строка или карточка вырастает пружиной, ложится
 * поверх соседних и отбрасывает тень. Основной отклик на наведение во всех
 * видах — тон подложки при этом не меняется, чтобы значение цвета осталось
 * за самим значением.
 */
export const lift = {
  transition: `scale ${vars.motion.spring} ${vars.motion.springEase}, box-shadow ${vars.motion.quick} ease`,
  '@media': {
    [media.hover]: {
      selectors: {
        '&:hover': {
          zIndex: 1,
          scale: '1.008',
          boxShadow: vars.shadow.raise
        }
      }
    }
  }
} as const

/** Кольцо фокуса с клавиатуры — одно на все интерактивные элементы. */
export const focusRing = {
  outline: 'none',
  selectors: {
    '&:focus-visible': { boxShadow: `0 0 0 3px ${vars.color.ring}` }
  }
} as const
