import { style } from '@vanilla-extract/css'

import { focusRing, media, press, vars } from '../theme.css.ts'

export const title = style({
  margin: `0 0 ${vars.space[4]}`,
  fontSize: vars.text.xl,
  fontWeight: 600,
  letterSpacing: '-0.01em'
})

export const list = style({
  display: 'grid',
  gap: vars.space[2]
})

/** Строка списка: плотная карточка, наведение — тон, нажатие — масштаб. */
export const card = style([
  press,
  focusRing,
  {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: vars.space[1],
    padding: `${vars.space[4]} ${vars.space[5]}`,
    '@media': {
      [media.phone]: { padding: `${vars.space[3]} ${vars.space[4]}` }
    },
    borderRadius: vars.radius.lg,
    background: vars.color.card,
    selectors: {
      '&:hover': { background: vars.color.toneSoft },
      '&:active': { scale: '0.99' }
    }
  }
])

export const name = style({ fontWeight: 600 })

export const path = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text.sm,
  color: vars.color.faint,
  /*
   * `anywhere`, а не `break-word`: только он уменьшает минимальную ширину
   * элемента. Иначе путь без пробелов растягивает карточку шире экрана —
   * перенос в ней уже есть, а место она всё равно требует по самой длинной
   * неразрывной части.
   */
  overflowWrap: 'anywhere'
})
