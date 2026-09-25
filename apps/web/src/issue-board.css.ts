import { style } from '@vanilla-extract/css'

import { focusRing, lift, media, vars } from './theme.css.ts'

/**
 * Колонок столько, сколько статусов у проекта. Они делят ширину поровну,
 * а невлезшие уходят вбок прокруткой, а не вторым рядом: второй ряд рвёт
 * путь задачи, который читается слева направо. Уже 240 точек колонку
 * не сжать: карточка перестаёт вмещать теги и переносит номер задачи.
 */
export const board = style({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: 'minmax(240px, 1fr)',
  overflowX: 'auto',
  gap: vars.space[3],
  '@media': {
    'screen and (max-width: 900px)': {
      gridAutoFlow: 'row',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
    },
    /*
     * На телефоне колонка одна на экран, остальные — листанием вбок.
     * Две колонки по 175 точек не доска, а два столбца обрезанных слов;
     * край следующей выглядывает, чтобы было видно, что доска не кончилась.
     */
    [media.phone]: {
      gridTemplateColumns: 'none',
      gridAutoFlow: 'column',
      gridAutoColumns: '82%',
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      marginInline: `calc(-1 * ${vars.space[3]})`,
      paddingInline: vars.space[3],
      scrollbarWidth: 'none'
    }
  }
})

/** Колонка — лист под карточками: на шаг темнее карточки, но светлее полотна. */
export const column = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  '@media': { [media.phone]: { scrollSnapAlign: 'start' } },
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

/**
 * Ссылка — всё, кроме подвала: в подвале номер, и он кнопка, а кнопку
 * в ссылку не вложить.
 */
export const cardLink = style([
  focusRing,
  {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space[2],
    borderRadius: vars.radius.md
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

export const empty = style({
  padding: `${vars.space[3]} ${vars.space[2]}`,
  fontSize: vars.text.sm,
  color: vars.color.faint
})
