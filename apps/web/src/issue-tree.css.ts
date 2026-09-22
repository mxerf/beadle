import { style } from '@vanilla-extract/css'

import { focusRing, lift, vars } from './theme.css.ts'

export const tree = style({
  display: 'grid',
  gap: vars.space[3]
})

/** Группа — плотная карточка: эпик и всё, что под ним, читаются как одно. */
export const group = style({
  padding: `${vars.space[3]} ${vars.space[4]} ${vars.space[2]}`,
  borderRadius: vars.radius.lg,
  background: vars.color.card
})

/** Заголовок группы — тоже ссылка: у эпика своя страница. */
export const head = style([
  lift,
  {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: vars.space[3],
    padding: `${vars.space[1]} ${vars.space[2]} ${vars.space[2]}`,
    borderRadius: vars.radius.md,
    background: vars.color.card
  }
])

/**
 * Ссылка занимает строку, кроме номера: номер — кнопка, а кнопку в ссылку
 * не вложить. То же и в ветке ниже.
 */
export const rowLink = style([
  focusRing,
  {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: vars.space[3],
    borderRadius: vars.radius.md
  }
])

export const heading = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: 600
})

export const progress = style({
  fontSize: vars.text.sm,
  color: vars.color.muted,
  whiteSpace: 'nowrap'
})

/** Полоса выполнения: доля закрытых потомков, без числа на самой полосе. */
export const bar = style({
  // `block` обязателен обоим: у строчного элемента высота и доля ширины
  // не работают, и полоса выходит нулевой.
  display: 'block',
  flexShrink: 0,
  width: '120px',
  height: '6px',
  borderRadius: vars.radius.pill,
  background: vars.color.tone,
  overflow: 'hidden'
})

export const barFill = style({
  display: 'block',
  height: '100%',
  borderRadius: vars.radius.pill,
  background: vars.color.primary,
  transition: `width ${vars.motion.spring} ${vars.motion.springEase}`
})

export const branch = style([
  lift,
  {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: vars.space[3],
    padding: `${vars.space[1]} ${vars.space[2]}`,
    borderRadius: vars.radius.md,
    background: vars.color.card
  }
])

export const title = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: vars.text.sm
})

/** Задача, оставленная как путь к детям: она сама под фильтр не попала. */
export const context = style({ color: vars.color.faint })

/** Отступ вложенности — волоском, а не пустотой: видно, где чья ветка. */
export const nested = style({
  marginLeft: vars.space[3],
  paddingLeft: vars.space[3],
  borderLeft: `1px solid ${vars.color.line}`
})

export const loose = style({
  padding: `${vars.space[3]} ${vars.space[4]}`,
  fontSize: vars.text.sm,
  color: vars.color.muted
})
