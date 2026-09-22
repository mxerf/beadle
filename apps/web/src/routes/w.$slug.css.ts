import { style } from '@vanilla-extract/css'

import { focusRing, press, vars } from '../theme.css.ts'

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

/** Вход в справку по клавишам: без него о ней никто не узнает. */
export const hint = style([
  press,
  focusRing,
  {
    width: '24px',
    height: '24px',
    borderRadius: vars.radius.pill,
    background: vars.color.tone,
    color: vars.color.muted,
    fontSize: vars.text.sm,
    transition: `background-color ${vars.motion.quick} ease, color ${vars.motion.quick} ease`,
    selectors: {
      '&:hover': { background: vars.color.toneStrong, color: vars.color.text }
    }
  }
])
