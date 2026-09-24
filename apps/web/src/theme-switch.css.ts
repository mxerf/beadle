import { style } from '@vanilla-extract/css'

import { focusRing, media, press, vars } from './theme.css.ts'

/** Тихая, как ссылка на список проектов рядом: тема — не то, что меняют часто. */
export const themeSwitch = style([
  press,
  focusRing,
  {
    display: 'grid',
    placeItems: 'center',
    width: '32px',
    height: '32px',
    // Палец в шестнадцать точек не попадает.
    '@media': { [media.phone]: { width: '40px', height: '40px' } },
    borderRadius: vars.radius.pill,
    background: 'transparent',
    color: vars.color.muted,
    selectors: {
      '&:hover': { background: vars.color.tone, color: vars.color.text }
    }
  }
])
