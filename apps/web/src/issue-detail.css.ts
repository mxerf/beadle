import { style } from '@vanilla-extract/css'

import { focusRing, lift, press, vars } from './theme.css.ts'

export const back = style([
  press,
  focusRing,
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space[2],
    height: '30px',
    padding: `0 ${vars.space[3]}`,
    marginBottom: vars.space[3],
    borderRadius: vars.radius.pill,
    color: vars.color.muted,
    fontSize: vars.text.sm,
    selectors: {
      '&:hover': { background: vars.color.tone, color: vars.color.text }
    }
  }
])

export const head = style({ marginBottom: vars.space[4] })

export const number = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text.sm,
  color: vars.color.faint
})

export const title = style({
  margin: `${vars.space[1]} 0 ${vars.space[3]}`,
  fontSize: vars.text.xl,
  fontWeight: 600,
  lineHeight: 1.25,
  letterSpacing: '-0.01em'
})

export const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space[2]
})

/** Текст слева, обстановка справа: длинное описание не должно тянуться во всю ширину. */
export const layout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 300px',
  gap: vars.space[5],
  alignItems: 'start',
  '@media': {
    'screen and (max-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr)' }
  }
})

/**
 * `minWidth: 0` обязателен обоим: элемент сетки по умолчанию не уже своего
 * содержимого, и без этого длинный заголовок связи распирает колонку наружу
 * вместо того, чтобы обрезаться многоточием.
 */
export const main = style({
  display: 'grid',
  gap: vars.space[3],
  minWidth: 0
})

export const aside = style({
  display: 'grid',
  gap: vars.space[3],
  minWidth: 0,
  position: 'sticky',
  top: vars.space[4]
})

export const card = style({
  minWidth: 0,
  padding: `${vars.space[4]} ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  background: vars.color.card
})

export const cardTitle = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space[2],
  margin: `0 0 ${vars.space[3]}`,
  fontSize: vars.text.sm,
  fontWeight: 600,
  color: vars.color.muted
})

/** Пара «поле — значение» в обстановке справа. */
export const field = style({
  display: 'grid',
  gridTemplateColumns: '90px minmax(0, 1fr)',
  gap: vars.space[2],
  padding: `${vars.space[1]} 0`,
  fontSize: vars.text.sm
})

export const fieldName = style({ color: vars.color.faint })

export const labels = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[1],
  marginTop: vars.space[2]
})

/** Строка-ссылка на соседнюю задачу: то же, что ветка в эпиках. */
export const link = style([
  lift,
  focusRing,
  {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: vars.space[2],
    minWidth: 0,
    padding: `${vars.space[1]} ${vars.space[2]}`,
    borderRadius: vars.radius.md,
    background: vars.color.card,
    fontSize: vars.text.sm
  }
])

/**
 * В боковой колонке связь не влезает строкой: 300 пикселей на заголовок,
 * теги и номер обрезают заголовок до бессмыслицы. Поэтому там она складывается
 * в две строки — обстановка сверху, название под ней.
 */
export const linkStacked = style([
  lift,
  focusRing,
  {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space[1],
    minWidth: 0,
    padding: vars.space[2],
    borderRadius: vars.radius.md,
    background: vars.color.card,
    fontSize: vars.text.sm
  }
])

export const linkMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2]
})

export const linkWrapped = style({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  lineHeight: 1.4
})

export const linkTitle = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

export const linkId = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text.xs,
  color: vars.color.faint
})

export const progress = style({
  marginLeft: 'auto',
  fontSize: vars.text.sm,
  fontWeight: 400,
  color: vars.color.faint
})

export const comment = style({
  padding: `${vars.space[3]} 0`,
  borderTop: `1px solid ${vars.color.line}`
})

export const commentHead = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space[2],
  marginBottom: vars.space[2],
  fontSize: vars.text.sm
})

export const commentAuthor = style({ fontWeight: 600 })
export const commentDate = style({ color: vars.color.faint })

export const empty = style({
  fontSize: vars.text.sm,
  color: vars.color.faint
})
