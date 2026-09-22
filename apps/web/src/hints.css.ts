import { style } from '@vanilla-extract/css'

import { focusRing, press, vars } from './theme.css.ts'

/**
 * Подсказка всплывает над содержимым — значит, по третьему правилу системы
 * она тёмный остров с обратным контрастом, а не полупрозрачная панель.
 * Угол экрана, а не середина: это справка, к которой подглядывают, а не
 * окно, которое перекрывает работу.
 */
export const island = style({
  position: 'fixed',
  right: vars.space[4],
  bottom: vars.space[4],
  zIndex: 20,
  minWidth: '230px',
  padding: `${vars.space[3]} ${vars.space[4]} ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  background: vars.color.island,
  color: vars.color.islandText,
  boxShadow: vars.shadow.raise
})

export const head = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[3],
  marginBottom: vars.space[3]
})

export const name = style({
  fontSize: vars.text.sm,
  fontWeight: 600
})

export const close = style([
  press,
  focusRing,
  {
    padding: `2px ${vars.space[2]}`,
    borderRadius: vars.radius.pill,
    background: 'transparent',
    color: vars.color.islandFaint,
    fontSize: vars.text.xs,
    selectors: {
      '&:hover': { color: vars.color.islandText }
    }
  }
])

export const rows = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'baseline',
  gap: `${vars.space[2]} ${vars.space[3]}`,
  margin: 0
})

export const key = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text.sm,
  whiteSpace: 'nowrap'
})

export const what = style({
  margin: 0,
  fontSize: vars.text.sm,
  color: vars.color.islandFaint
})
