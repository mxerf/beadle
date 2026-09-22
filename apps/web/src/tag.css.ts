import { style, styleVariants } from '@vanilla-extract/css'

import { vars } from './theme.css.ts'

/**
 * Тег — маленькая пилюля мягким тоном: цвет подписи и цвет подложки одной
 * семьи. Стили общие для всех видов: приоритет в списке и на доске обязан
 * выглядеть одинаково, иначе вид меняет смысл значения.
 */
const base = style({
  padding: `2px ${vars.space[2]}`,
  borderRadius: vars.radius.pill,
  fontSize: vars.text.xs,
  fontWeight: 600,
  textAlign: 'center',
  whiteSpace: 'nowrap'
})

export const tone = styleVariants({
  neutral: [base, { background: vars.color.tone, color: vars.color.muted }],
  quiet: [
    base,
    { background: vars.color.tone, color: vars.color.muted, fontWeight: 500 }
  ],
  brand: [
    base,
    { background: vars.color.primarySoft, color: vars.color.primary }
  ],
  info: [base, { background: vars.color.infoSoft, color: vars.color.info }],
  warning: [
    base,
    { background: vars.color.warningSoft, color: vars.color.warning }
  ],
  danger: [
    base,
    { background: vars.color.dangerSoft, color: vars.color.danger }
  ]
})

export type TagTone = keyof typeof tone
