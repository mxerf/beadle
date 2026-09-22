import { style, styleVariants } from '@vanilla-extract/css'

import { focusRing, media, press, vars } from './theme.css.ts'

export const bar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space[2],
  marginBottom: vars.space[4]
})

/**
 * Свёрнутая панель. Кнопка не считает фильтры, а называет их: «3 фильтра»
 * заставляют разворачивать панель, чтобы вспомнить, какие именно, — а места
 * под пару слов на телефоне ровно столько же.
 */
export const toggle = style([
  press,
  focusRing,
  {
    display: 'none',
    '@media': {
      [media.phone]: {
        display: 'block',
        maxWidth: '100%',
        height: '34px',
        padding: `0 ${vars.space[3]}`,
        borderRadius: vars.radius.pill,
        background: vars.color.tone,
        color: vars.color.text,
        fontSize: vars.text.sm,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        order: 1
      }
    }
  }
])

/**
 * На большом экране обёртки нет вовсе (`contents`): группы остаются прямыми
 * детьми панели, и раскладка там ровно та же, что была до появления телефона.
 */
const groupsBase = style({ display: 'contents' })

export const groups = styleVariants({
  open: [
    groupsBase,
    {
      '@media': {
        [media.phone]: {
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: vars.space[1],
          flexBasis: '100%',
          order: 4
        }
      }
    }
  ],
  shut: [groupsBase, { '@media': { [media.phone]: { display: 'none' } } }]
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
    '@media': {
      // Поиск на телефоне — во всю ширину: набирать в трети строки нечем.
      [media.phone]: { flexBasis: '100%', minWidth: 0, order: 3 }
    },
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
    '@media': { [media.phone]: { order: 2 } },
    selectors: {
      '&:hover': { background: vars.color.tone, color: vars.color.text }
    }
  }
])
