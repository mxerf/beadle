import { style, styleVariants } from '@vanilla-extract/css'

import { focusRing, press, vars } from './theme.css.ts'

export const nav = style({
  display: 'flex',
  gap: vars.space[1],
  marginLeft: 'auto'
})

const tabBase = style([
  press,
  focusRing,
  {
    height: '30px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: `0 ${vars.space[3]}`,
    borderRadius: vars.radius.pill,
    fontSize: vars.text.sm,
    fontWeight: 500
  }
])

export const tab = styleVariants({
  off: [
    tabBase,
    {
      color: vars.color.muted,
      selectors: {
        '&:hover': { background: vars.color.tone, color: vars.color.text }
      }
    }
  ],
  on: [
    tabBase,
    {
      background: vars.color.primarySoft,
      color: vars.color.primary,
      fontWeight: 600
    }
  ]
})
