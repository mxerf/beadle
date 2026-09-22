import { createGlobalTheme } from '@vanilla-extract/css'

/**
 * Токены дизайн-системы v3 («тёплая бумага»), перенесённые из exploo
 * (`apps/web/src/ds/tokens.css`). Три правила системы держатся и здесь:
 *
 * 1. Поверхности непрозрачные и различаются тоном, а не рамкой и тенью.
 *    Волосяная линия допустима только как разделитель.
 * 2. Все углы — суперэллипса, а не круглая дуга.
 * 3. Наведение меняет цвет подложки, нажатие — масштаб. Прозрачностью
 *    состояние не показывается.
 */
export const vars = createGlobalTheme(':root', {
  color: {
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
    infoSoft: 'oklch(0.65 0.15 235 / 14%)'
  },
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
   * Смена цвета и нажатие — мгновенные (`quick`). Подъём строки списка идёт
   * пружиной: кривая посчитана как затухающий осциллятор (ζ=0.42, ω=12),
   * перелёт 23% и два всё более мелких качка. `linear()` описывает её
   * точками — обычной кубической безье такое не выразить.
   */
  motion: {
    quick: '150ms',
    spring: '420ms',
    springEase:
      'linear(0, 0.107, 0.356, 0.648, 0.911, 1.101, 1.206, 1.233, 1.205, 1.145, 1.077, 1.017, 0.974, 0.951, 0.946, 0.953, 0.967, 0.983, 0.997, 1.007, 1.012, 1.013, 1.011, 1.007, 1)'
  },
  /** Приподнятая поверхность, лежащая на листе, — не парящая панель. */
  shadow: {
    raise:
      '0 1px 2px oklch(0.25 0.01 80 / 6%), 0 8px 20px oklch(0.25 0.01 80 / 8%)'
  },
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

/** Нажатие отзывается масштабом — это основной отклик системы. */
export const press = {
  transition: `background-color ${vars.motion.quick} ease, color ${vars.motion.quick} ease, scale ${vars.motion.quick} ease`,
  selectors: {
    '&:active': { scale: '0.98' }
  }
} as const

/** Кольцо фокуса с клавиатуры — одно на все интерактивные элементы. */
export const focusRing = {
  outline: 'none',
  selectors: {
    '&:focus-visible': { boxShadow: `0 0 0 3px ${vars.color.ring}` }
  }
} as const
