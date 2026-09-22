import { style, styleVariants } from '@vanilla-extract/css'

import { focusRing, media, press, vars } from './theme.css.ts'

/**
 * Номер задачи — кнопка: его копируют, чтобы отдать `bd` в терминале или
 * вставить в переписку. Поэтому он лежит рядом со ссылкой на строку,
 * а не внутри неё: кнопку нельзя вкладывать в ссылку, да и нажатие на
 * номер не должно уводить со страницы.
 *
 * Раскладку кнопка не задаёт: где ей стоять, знает вид, а не она.
 */
const base = style([
  press,
  focusRing,
  {
    padding: `2px ${vars.space[1]}`,
    // Палец не попадает в строчку текста высотой в тринадцать точек.
    '@media': {
      [media.phone]: { padding: `${vars.space[1]} ${vars.space[2]}` }
    },
    borderRadius: vars.radius.sm,
    background: 'transparent',
    fontFamily: vars.font.mono,
    fontSize: vars.text.sm,
    transition: `background-color ${vars.motion.quick} ease, color ${vars.motion.quick} ease`
  }
])

export const copy = styleVariants({
  plain: [
    base,
    {
      color: vars.color.faint,
      selectors: {
        '&:hover': { background: vars.color.tone, color: vars.color.text }
      }
    }
  ],
  /** Подтверждение — тоном на самом номере: человек смотрит туда, куда нажал. */
  copied: [
    base,
    {
      background: vars.color.primarySoft,
      color: vars.color.primary
    }
  ]
})
