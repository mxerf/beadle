import { globalStyle, style } from '@vanilla-extract/css'

import { media, vars } from './theme.css.ts'

/**
 * Разметка приходит из описаний задач — их пишут люди и агенты, и там
 * встречается всё: заголовки, списки, код, таблицы. Стили заданы глобально
 * внутри этого класса: размечает библиотека, и навесить класс на каждый
 * элемент негде.
 */
export const body = style({
  fontSize: vars.text.base,
  lineHeight: 1.6,
  overflowWrap: 'anywhere'
})

globalStyle(`${body} > :first-child`, { marginTop: 0 })
globalStyle(`${body} > :last-child`, { marginBottom: 0 })

globalStyle(`${body} h1, ${body} h2, ${body} h3, ${body} h4`, {
  margin: `${vars.space[5]} 0 ${vars.space[2]}`,
  fontWeight: 600,
  lineHeight: 1.3
})

globalStyle(`${body} h1`, { fontSize: vars.text.lg })
globalStyle(`${body} h2`, { fontSize: vars.text.lg })
globalStyle(`${body} h3`, { fontSize: vars.text.base })
globalStyle(`${body} h4`, { fontSize: vars.text.base, color: vars.color.muted })

globalStyle(`${body} p, ${body} ul, ${body} ol, ${body} blockquote`, {
  margin: `0 0 ${vars.space[3]}`
})

globalStyle(`${body} ul, ${body} ol`, { paddingLeft: vars.space[5] })
globalStyle(`${body} li`, { margin: `${vars.space[1]} 0` })

globalStyle(`${body} a`, {
  color: vars.color.primary,
  textDecoration: 'underline',
  textUnderlineOffset: '2px'
})

/** Код — тональной подложкой, как поля ввода: он часть текста, а не врезка. */
globalStyle(`${body} code`, {
  padding: '1px 5px',
  borderRadius: vars.radius.sm,
  background: vars.color.tone,
  fontFamily: vars.font.mono,
  fontSize: vars.text.sm
})

globalStyle(`${body} pre`, {
  margin: `0 0 ${vars.space[3]}`,
  padding: vars.space[3],
  borderRadius: vars.radius.md,
  background: vars.color.tone,
  overflowX: 'auto'
})

globalStyle(`${body} pre code`, {
  padding: 0,
  background: 'none',
  fontSize: vars.text.sm,
  lineHeight: 1.5
})

globalStyle(`${body} blockquote`, {
  paddingLeft: vars.space[3],
  borderLeft: `2px solid ${vars.color.line}`,
  color: vars.color.muted
})

globalStyle(`${body} table`, {
  width: '100%',
  margin: `0 0 ${vars.space[3]}`,
  borderCollapse: 'collapse',
  fontSize: vars.text.sm,
  '@media': {
    // Таблица шире экрана прокручивается внутри себя, а не растягивает
    // страницу. Только на телефоне: `block` отбирает у таблицы выравнивание
    // колонок по всей ширине, и на большом экране это заметно.
    [media.phone]: { display: 'block', overflowX: 'auto' }
  }
})

globalStyle(`${body} th, ${body} td`, {
  padding: `${vars.space[1]} ${vars.space[2]}`,
  textAlign: 'left',
  borderBottom: `1px solid ${vars.color.line}`
})

globalStyle(`${body} th`, { fontWeight: 600 })

globalStyle(`${body} hr`, {
  margin: `${vars.space[4]} 0`,
  border: 'none',
  borderTop: `1px solid ${vars.color.line}`
})

globalStyle(`${body} img`, { maxWidth: '100%' })
