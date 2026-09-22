import { style } from '@vanilla-extract/css'

import { vars } from '../theme.css.ts'

export const head = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: vars.space[3],
  marginBottom: vars.space[4]
})

export const name = style({
  margin: 0,
  fontSize: vars.text.xl,
  fontWeight: 600,
  letterSpacing: '-0.01em'
})

export const counts = style({
  fontSize: vars.text.sm,
  color: vars.color.muted
})
