import { style, styleVariants } from '@vanilla-extract/css'

import { focusRing, press, vars } from './theme.css.ts'

/** Подпись, которая при этом кнопка: тише фильтров и не просит внимания. */
export const refresh = style([
  press,
  focusRing,
  {
    padding: `2px ${vars.space[2]}`,
    marginInline: `calc(-1 * ${vars.space[2]})`,
    borderRadius: vars.radius.pill,
    background: 'transparent',
    color: vars.color.muted,
    fontSize: vars.text.sm,
    transition: `background-color ${vars.motion.quick} ease, color ${vars.motion.quick} ease`,
    selectors: {
      '&:hover': { background: vars.color.tone, color: vars.color.text }
    }
  }
])

/**
 * Точка состояния: зелёная — новости придут сами, серая — страница будет
 * стареть молча. Цвет, а не прозрачность: выключенное здесь не «приглушённое
 * включённое», а другое состояние.
 */
const markBase = style({
  display: 'inline-block',
  width: '6px',
  height: '6px',
  marginRight: vars.space[2],
  borderRadius: vars.radius.pill,
  verticalAlign: 'middle'
})

export const mark = styleVariants({
  live: [markBase, { background: vars.color.primary }],
  still: [markBase, { background: vars.color.faint }]
})
