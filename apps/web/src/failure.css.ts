import { style } from '@vanilla-extract/css'

import { focusRing, press, vars } from './theme.css.ts'

export const row = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space[3]
})

/** Выход из тупика: та же пилюля, что у фильтров, но в тоне сообщения. */
export const action = style([
  press,
  focusRing,
  {
    height: '30px',
    padding: `0 ${vars.space[3]}`,
    borderRadius: vars.radius.pill,
    background: vars.color.card,
    color: vars.color.danger,
    fontSize: vars.text.sm,
    fontWeight: 600
  }
])
