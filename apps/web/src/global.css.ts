import { globalStyle } from '@vanilla-extract/css'

import { vars } from './theme.css.ts'

/**
 * `corner-shape` — свойство 2025 года, типы csstype его ещё не знают, а
 * vanilla-extract берёт список свойств оттуда. Расширяем типы, а не пробиваем
 * их приведением: приведение спрятало бы заодно и настоящую опечатку.
 */
declare module 'csstype' {
  interface StandardLonghandProperties<
    TLength = (string & {}) | 0,
    TTime = string & {}
  > {
    cornerShape?: string
  }
}

globalStyle('*, *::before, *::after', { boxSizing: 'border-box' })

globalStyle('html, body, #root', { height: '100%' })

/**
 * Углы всей системы — суперэллипса, а не круглая дуга. `:where` держит
 * специфичность нулевой, поэтому отдельная форма задаётся обычным правилом.
 * Псевдоэлементы перечислены рядом: `:where()` — прощающий список и молча
 * выбрасывает `*::before`.
 *
 * `corner-shape` умеет только Chromium; в Safari и Firefox углы останутся
 * круглыми. Это деградация внешности, а не поломка — путь-фоллбэк на
 * `clip-path` из exploo переносится, если понадобится.
 */
const squircle = { cornerShape: vars.shape.corner }

globalStyle(':where(*)', squircle)
globalStyle(':where(*)::before', squircle)
globalStyle(':where(*)::after', squircle)

globalStyle('body', {
  margin: 0,
  background: vars.color.paper,
  color: vars.color.text,
  fontFamily: vars.font.ui,
  fontSize: vars.text.base,
  lineHeight: 1.5,
  // Кириллица в интерфейсе — основной язык задач, а не исключение.
  textRendering: 'optimizeLegibility'
})

/** Системная просьба «меньше движения» гасит и пружину, и нажатия. */
globalStyle('*', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms !important'
    }
  }
})

globalStyle('a', { color: 'inherit', textDecoration: 'none' })

globalStyle('button, input', { font: 'inherit', color: 'inherit' })

globalStyle('button', { border: 'none', cursor: 'pointer' })
