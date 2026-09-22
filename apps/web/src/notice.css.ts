import { style, styleVariants } from '@vanilla-extract/css'

import { vars } from './theme.css.ts'

const base = style({
  padding: `${vars.space[4]} ${vars.space[5]}`,
  borderRadius: vars.radius.lg
})

/** Поверхности плотные: отказ отличается тоном подложки, а не рамкой. */
export const tone = styleVariants({
  muted: [base, { background: vars.color.card, color: vars.color.muted }],
  failure: [
    base,
    { background: vars.color.dangerSoft, color: vars.color.danger }
  ]
})

export const hint = style({
  marginTop: vars.space[2],
  fontFamily: vars.font.mono,
  fontSize: vars.text.sm,
  color: vars.color.faint
})
