import { style, styleVariants } from '@vanilla-extract/css'

import { focusRing, press, vars } from './theme.css.ts'

/**
 * Переключатель-таблетка. Одной формой набираются и фильтры, и группировка:
 * это один и тот же жест «включить измерение», и выглядеть он обязан
 * одинаково, в какой бы панели ни стоял.
 *
 * Включённое состояние показано подложкой и насыщенностью, а не
 * прозрачностью: выключенная таблетка — не приглушённая включённая.
 */
const base = style([
  press,
  focusRing,
  {
    height: '34px',
    padding: `0 ${vars.space[3]}`,
    borderRadius: vars.radius.pill,
    fontSize: vars.text.sm,
    fontWeight: 500,
    whiteSpace: 'nowrap'
  }
])

export const chip = styleVariants({
  off: [
    base,
    {
      background: vars.color.tone,
      color: vars.color.text,
      selectors: {
        '&:hover': { background: vars.color.toneStrong }
      }
    }
  ],
  on: [
    base,
    {
      background: vars.color.primarySoft,
      color: vars.color.primary,
      fontWeight: 600,
      selectors: {
        '&:hover': { background: vars.color.primarySoftStrong }
      }
    }
  ]
})
