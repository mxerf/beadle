import { style } from '@vanilla-extract/css'

import { focusRing, press, vars } from './theme.css.ts'

export const bar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space[2],
  marginBottom: vars.space[4]
})

/** Группы фильтров стоят плотнее внутри себя, чем между собой. */
export const group = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[1],
  marginRight: vars.space[2]
})

/** Поле без рамки: подложка тоном, фокус — карточка и кольцо. */
export const search = style([
  focusRing,
  {
    flex: 1,
    minWidth: '220px',
    height: '34px',
    padding: `0 ${vars.space[4]}`,
    borderRadius: vars.radius.md,
    border: 'none',
    background: vars.color.tone,
    fontSize: vars.text.sm,
    transition: `background-color ${vars.motion.quick} ease`,
    selectors: {
      '&::placeholder': { color: vars.color.faint },
      '&:hover': { background: vars.color.toneStrong },
      '&:focus-visible': { background: vars.color.card }
    }
  }
])

export const reset = style([
  press,
  focusRing,
  {
    height: '34px',
    padding: `0 ${vars.space[3]}`,
    borderRadius: vars.radius.pill,
    background: 'transparent',
    color: vars.color.muted,
    fontSize: vars.text.sm,
    selectors: {
      '&:hover': { background: vars.color.tone, color: vars.color.text }
    }
  }
])
