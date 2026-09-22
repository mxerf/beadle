import { style } from '@vanilla-extract/css'

import { focusRing, lift, vars } from './theme.css.ts'

/** Поток островков: между группами воздух, сами они — карточки. */
export const islands = style({
  display: 'grid',
  gap: vars.space[3]
})

/**
 * Плотная карточка — как группа в эпиках: разделителей нет, строки
 * различаются подъёмом под курсором. Поля карточки дают строке место
 * вырасти, не вылезая за её край. Без группировки такая карточка одна
 * на весь список, с группировкой — по одной на группу.
 *
 * Колонки объявлены здесь, а строки берут их через `subgrid`: иначе каждая
 * строка меряет ширину сама, и статусы с номерами пляшут по вертикали.
 * Плата за островки — что выравнивание теперь внутри группы, а не на весь
 * список: у каждой карточки своя сетка. В эпиках так же.
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
  focusRing,
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

/**
 * Заголовок островка. Липнет к верху окна: в группе из сотни строк человек
 * доходит до середины и перестаёт помнить, чью строку читает.
 *
 * Отрицательные поля по бокам — чтобы плотная подложка покрыла поля
 * карточки целиком: иначе строки проезжают сквозь заголовок по краям.
 * `zIndex` выше, чем у поднятой строки: та под заголовок уезжает, а не
 * наползает на него.
 */
export const groupHead = style({
  position: 'sticky',
  top: 0,
  zIndex: 2,
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space[2],
  gridColumn: '1 / -1',
  marginInline: `calc(-1 * ${vars.space[4]})`,
  padding: `${vars.space[1]} ${vars.space[4]} ${vars.space[2]}`,
  background: vars.color.card
})

export const groupCaption = style({
  fontSize: vars.text.sm,
  fontWeight: 600
})

/** Заголовок группы эпика — ссылка: у эпика есть своя страница. */
export const groupLink = style([
  focusRing,
  groupCaption,
  {
    borderRadius: vars.radius.sm,
    transition: `color ${vars.motion.quick} ease`,
    selectors: {
      '&:hover': { color: vars.color.primary }
    }
  }
])

export const groupCount = style({
  fontSize: vars.text.sm,
  color: vars.color.faint
})
