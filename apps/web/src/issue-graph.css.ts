import { style } from '@vanilla-extract/css'

import { focusRing, lift, vars } from './theme.css.ts'

export const graph = style({
  display: 'grid',
  gap: vars.space[3]
})

/**
 * Связка — островок: внутри одна цепочка работ, между островками общего нет.
 * Уровень поверхности тот же, что у колонки доски: связка — контейнер под
 * карточками, а не карточка сама по себе.
 *
 * Длинная цепочка уезжает вбок внутри своего островка, а не растягивает
 * страницу: рядом лежат другие связки, и им от этого хуже.
 */
export const component = style({
  display: 'flex',
  // Ширина по содержимому: длина островка сама показывает длину цепочки,
  // а растянутый на всю страницу ряд из двух шагов врёт о её размере.
  justifySelf: 'start',
  maxWidth: '100%',
  gap: vars.space[4],
  padding: vars.space[3],
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  overflowX: 'auto'
})

/** Колонка — шаг. Задачи внутри шага друг друга не ждут. */
export const step = style({
  display: 'flex',
  flexShrink: 0,
  flexDirection: 'column',
  gap: vars.space[2],
  width: '230px'
})

export const stepName = style({
  padding: `0 ${vars.space[1]}`,
  fontSize: vars.text.sm,
  color: vars.color.muted
})

export const card = style([
  lift,
  {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space[2],
    padding: vars.space[3],
    borderRadius: vars.radius.md,
    background: vars.color.card
  }
])

export const cardLink = style([
  focusRing,
  {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space[2],
    borderRadius: vars.radius.md
  }
])

export const tags = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[1]
})

/** Две строки заголовка: колонка узкая, а карточек в ряду бывает много. */
export const title = style({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  fontSize: vars.text.sm,
  lineHeight: 1.4
})

/** Задача, оставленная как путь: сама она под отбор не попала. */
export const context = style({ color: vars.color.faint })

export const foot = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[2]
})
