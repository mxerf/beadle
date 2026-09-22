import { style, styleVariants } from '@vanilla-extract/css'

import { vars } from './theme.css.ts'

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
 * Наведение не красит строку, а поднимает её: пружина увеличивает масштаб,
 * строка ложится поверх соседних и отбрасывает тень. Разделитель живёт
 * в псевдоэлементе, потому что тень строки занята подъёмом.
 */
export const row = style({
  position: 'relative',
  display: 'grid',
  gridColumn: '1 / -1',
  gridTemplateColumns: 'subgrid',
  alignItems: 'center',
  gap: vars.space[3],
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.md,
  transition: `scale ${vars.motion.spring} ${vars.motion.springEase}, box-shadow ${vars.motion.quick} ease`,
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
    '&:hover': {
      zIndex: 1,
      scale: '1.014',
      // Подложка обязана быть плотной: иначе сквозь поднятую строку
      // просвечивает разделитель соседней.
      background: vars.color.card,
      boxShadow: vars.shadow.raise
    }
  }
})

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
 * Тег: маленькая пилюля мягким тоном — цвет и подложка одной семьи.
 * Подпись по центру: колонки списка общие, и пилюли в них одной ширины.
 */
const tagBase = style({
  padding: `2px ${vars.space[2]}`,
  textAlign: 'center',
  borderRadius: vars.radius.pill,
  fontSize: vars.text.xs,
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

/** Приоритет читается цветом: P0 и P1 должны быть видны боковым зрением. */
export const priority = styleVariants({
  hot: [
    tagBase,
    { background: vars.color.dangerSoft, color: vars.color.danger }
  ],
  warm: [
    tagBase,
    { background: vars.color.warningSoft, color: vars.color.warning }
  ],
  cold: [tagBase, { background: vars.color.tone, color: vars.color.muted }]
})

export const type = style([
  tagBase,
  { background: vars.color.tone, color: vars.color.muted, fontWeight: 500 }
])

export const status = styleVariants({
  open: [tagBase, { background: vars.color.infoSoft, color: vars.color.info }],
  in_progress: [
    tagBase,
    { background: vars.color.warningSoft, color: vars.color.warning }
  ],
  deferred: [tagBase, { background: vars.color.tone, color: vars.color.muted }],
  closed: [
    tagBase,
    { background: vars.color.primarySoft, color: vars.color.primary }
  ]
})

export const blocked = style([
  tagBase,
  { background: vars.color.dangerSoft, color: vars.color.danger }
])
