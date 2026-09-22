import { style } from '@vanilla-extract/css'

import { lift, vars } from './theme.css.ts'

export const board = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: vars.space[3],
  '@media': {
    'screen and (max-width: 900px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
    }
  }
})

/** Колонка — лист под карточками: на шаг темнее карточки, но светлее полотна. */
export const column = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  padding: vars.space[2],
  borderRadius: vars.radius.lg,
  background: vars.color.surface
})

export const columnHead = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[1]} ${vars.space[2]} ${vars.space[3]}`
})

export const columnName = style({
  fontSize: vars.text.sm,
  fontWeight: 600
})

export const columnCount = style({
  fontSize: vars.text.sm,
  color: vars.color.faint
})

/**
 * Колонка прокручивается внутри себя: у живого проекта в «закрыта» лежит
 * больше половины задач, и без этого доска растягивает страницу, унося
 * фильтры и шапку за верхний край.
 */
export const stack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[2],
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 300px)',
  // Поля дают поднятой карточке место вырасти, не попав под обрез прокрутки.
  padding: `${vars.space[1]} ${vars.space[1]} ${vars.space[2]}`
})

export const card = style([
  lift,
  {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space[2],
    padding: `${vars.space[3]} ${vars.space[3]}`,
    borderRadius: vars.radius.md,
    background: vars.color.card
  }
])

export const cardHead = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[1]
})

/** Три строки заголовка: дальше карточки перестают быть сравнимыми глазом. */
export const title = style({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
  fontSize: vars.text.sm,
  lineHeight: 1.4
})

export const foot = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[2],
  fontSize: vars.text.xs,
  color: vars.color.faint
})

export const id = style({ fontFamily: vars.font.mono })

export const empty = style({
  padding: `${vars.space[3]} ${vars.space[2]}`,
  fontSize: vars.text.sm,
  color: vars.color.faint
})
