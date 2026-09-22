import { style } from '@vanilla-extract/css'

import { lift, vars } from './theme.css.ts'

/**
 * Одна плотная карточка на весь список: рамок нет, строки делит волосок.
 * Колонки объявлены здесь, а строки берут их через `subgrid`: иначе каждая
 * строка меряет ширину сама, и статусы с номерами пляшут по вертикали.
 */
export const list = style({
  display: 'grid',
  gridTemplateColumns: 'auto auto minmax(0, 1fr) auto auto auto auto',
  borderRadius: vars.radius.lg,
  background: vars.color.card
})

/**
 * Наведение не красит строку, а поднимает её. Разделитель живёт
 * в псевдоэлементе, потому что тень строки занята подъёмом.
 */
export const row = style([
  lift,
  {
    position: 'relative',
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
    alignItems: 'center',
    gap: vars.space[3],
    padding: `${vars.space[2]} ${vars.space[4]}`,
    borderRadius: vars.radius.md,
    selectors: {
      '&::after': {
        content: '""',
        position: 'absolute',
        insetInline: vars.space[4],
        bottom: 0,
        height: '1px',
        background: vars.color.line
      },
      '&:last-child::after': { content: 'none' },
      '&:hover::after': { background: 'transparent' },
      // Подложка поднятой строки обязана быть плотной: иначе сквозь неё
      // просвечивает разделитель соседней.
      '&:hover': { background: vars.color.card }
    }
  }
])

export const id = style({
  justifySelf: 'end',
  fontFamily: vars.font.mono,
  fontSize: vars.text.sm,
  color: vars.color.faint
})

export const title = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

export const closed = style({ color: vars.color.muted })

/** Исполнитель — своя колонка: у большинства задач она пустая. */
export const assignee = style({
  justifySelf: 'end',
  fontSize: vars.text.sm,
  color: vars.color.faint
})
