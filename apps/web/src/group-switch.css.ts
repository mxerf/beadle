import { style } from '@vanilla-extract/css'

import { vars } from './theme.css.ts'

/**
 * Панель стоит над списком, а не в строке фильтров: фильтры меняют состав
 * показанного, группировка — только раскладку, и «Сбросить» к ней
 * не относится.
 */
export const bar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space[1],
  marginBottom: vars.space[3]
})

/** Подпись дочитывается таблеткой: «Группировать по · статусу». */
export const label = style({
  marginRight: vars.space[1],
  fontSize: vars.text.sm,
  color: vars.color.muted
})
