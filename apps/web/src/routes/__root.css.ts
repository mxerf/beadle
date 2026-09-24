import { style } from '@vanilla-extract/css'

import { focusRing, media, press, vars } from '../theme.css.ts'

export const shell = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%'
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[3],
  padding: `${vars.space[4]} ${vars.space[5]} ${vars.space[2]}`,
  margin: '0 auto',
  '@media': {
    [media.phone]: { padding: `${vars.space[3]} ${vars.space[4]} 0` }
  },
  width: '100%',
  maxWidth: '1100px'
})

export const brand = style([
  press,
  focusRing,
  {
    display: 'inline-block',
    padding: `${vars.space[1]} ${vars.space[3]}`,
    borderRadius: vars.radius.pill,
    color: vars.color.muted,
    fontSize: vars.text.sm,
    fontWeight: 600,
    letterSpacing: '0.02em',
    selectors: {
      '&:hover': { background: vars.color.tone, color: vars.color.text }
    }
  }
])

export const main = style({
  flex: 1,
  padding: `${vars.space[3]} ${vars.space[5]} ${vars.space[6]}`,
  margin: '0 auto',
  '@media': {
    [media.phone]: {
      padding: `${vars.space[3]} ${vars.space[3]} ${vars.space[6]}`
    }
  },
  width: '100%',
  maxWidth: '1100px'
})
