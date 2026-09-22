import { style } from '@vanilla-extract/css'

import { vars } from '../theme.css.ts'

export const loose = style({
  margin: `${vars.space[3]} 0 0`,
  padding: `0 ${vars.space[4]}`,
  fontSize: vars.text.sm,
  color: vars.color.muted
})
