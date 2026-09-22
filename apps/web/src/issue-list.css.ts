import { style } from '@vanilla-extract/css'

import { lift, vars } from './theme.css.ts'

/**
 * Одна плотная карточка на весь список — как группа в эпиках: разделителей
 * нет, строки различаются подъёмом под курсором. Поля карточки дают строке
 * место вырасти, не вылезая за её край.
 *
 * Колонки объявлены здесь, а строки берут их через `subgrid`: иначе каждая
 * строка меряет ширину сама, и статусы с номерами пляшут по вертикали.
 */
export const list = style({
  display: 'grid',
  gridTemplateColumns: 'auto auto minmax(0, 1fr) auto auto auto auto',
  // Поля те же, что у группы в эпиках: подъём строки со своей тенью должен
  // уместиться внутри карточки, а не свисать с её края.
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  background: vars.color.card
})

/** Наведение не красит строку, а поднимает её над соседними. */
export const row = style([
  lift,
  {
    position: 'relative',
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
    alignItems: 'center',
    gap: vars.space[3],
    // Список разрежен против ветки в эпиках: там строка — часть группы
    // и жмётся к соседям, здесь она сама по себе и просит воздуха.
    padding: `${vars.space[2]} ${vars.space[2]}`,
    borderRadius: vars.radius.md,
    // Подложка поднятой строки обязана быть плотной: сквозь прозрачную
    // просвечивают соседние.
    selectors: { '&:hover': { background: vars.color.card } }
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
