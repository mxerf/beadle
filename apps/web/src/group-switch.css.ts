import { style } from '@vanilla-extract/css'

import { media, vars } from './theme.css.ts'

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
  marginBottom: vars.space[3],
  '@media': {
    // Одна строка с прокруткой вбок вместо двух: до списка и так далеко.
    [media.phone]: {
      flexWrap: 'nowrap',
      overflowX: 'auto',
      marginInline: `calc(-1 * ${vars.space[3]})`,
      paddingInline: vars.space[3],
      scrollbarWidth: 'none'
    }
  }
})

/** Подпись дочитывается таблеткой: «Группировать по · статусу». */
export const label = style({
  flexShrink: 0,
  marginRight: vars.space[1],
  fontSize: vars.text.sm,
  color: vars.color.muted
})
