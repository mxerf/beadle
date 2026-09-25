import { style } from '@vanilla-extract/css'

import { focusRing, lift, media, press, vars } from './theme.css.ts'

/**
 * Над списком одна строка: слева раскладка, справа действия со всем
 * показанным. На телефоне они расходятся на две — таблетки группировки
 * там листаются вбок и ширину занимают целиком. Переноса в столбце нет
 * намеренно: с ним ширина ряда считается по содержимому, и таблетки
 * распирают страницу вместо того, чтобы листаться.
 */
export const toolbar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[2],
  marginBottom: vars.space[3],
  '@media': {
    [media.phone]: {
      flexDirection: 'column',
      flexWrap: 'nowrap',
      alignItems: 'stretch'
    }
  }
})

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
  gridTemplateColumns: 'auto auto auto minmax(0, 1fr) auto auto auto auto',
  // Поля те же, что у группы в эпиках: подъём строки со своей тенью должен
  // уместиться внутри карточки, а не свисать с её края.
  padding: `${vars.space[2]} ${vars.space[4]}`,
  borderRadius: vars.radius.lg,
  background: vars.color.card,
  '@media': {
    /*
     * Восемь колонок в 390 точек не помещаются, и первым схлопывается
     * заголовок: в ширину `minmax(0, 1fr)` он ужимается до нуля, и список
     * показывает всё, кроме того, ради чего его открыли. Поэтому на телефоне
     * строка перестаёт быть строкой таблицы.
     */
    [media.phone]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      padding: `${vars.space[1]} ${vars.space[2]}`
    }
  }
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
    '@media': {
      // Подложка поднятой строки обязана быть плотной: сквозь прозрачную
      // просвечивают соседние. Наведение — только там, где есть курсор.
      [media.hover]: {
        selectors: { '&:hover': { background: vars.color.card } }
      },
      [media.phone]: {
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'start',
        gap: vars.space[2],
        padding: vars.space[2]
      }
    }
  }
])

/**
 * Галочка стоит вне ссылки: внутри неё нажатие уводило бы на страницу
 * задачи. Цвет — фирменный, как у включённой таблетки.
 */
export const pick = style({
  width: '16px',
  height: '16px',
  margin: 0,
  accentColor: vars.color.primary,
  cursor: 'pointer',
  '@media': {
    // Строка на телефоне выровнена по верху — галочка встаёт вровень
    // с первой строкой меток, а не с краем карточки.
    [media.phone]: { marginTop: '4px' }
  }
})

/**
 * Ссылка занимает строку целиком, кроме крайних колонок: слева галочка,
 * справа номер, и оба — кнопки. Колонки — та же подсетка, поэтому ячейки
 * остаются на своих местах; собственных полей у ссылки нет, иначе они
 * сдвинули бы дорожки.
 */
export const rowLink = style([
  focusRing,
  {
    display: 'grid',
    gridColumn: '2 / -2',
    gridTemplateColumns: 'subgrid',
    alignItems: 'center',
    gap: vars.space[3],
    borderRadius: vars.radius.md,
    '@media': {
      // Метки перетекают под заголовок сами: порядок в разметке колоночный,
      // и заголовок вытаскивается наверх, а не переставляется в коде.
      [media.phone]: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: vars.space[2],
        gridColumn: '2'
      }
    }
  }
])

/** Номер прижат к правому краю строки — как и был, пока был подписью. */
export const idCell = style({ justifySelf: 'end' })

/**
 * Заголовок и лейблы делят одну ячейку: лейблы идут следом за текстом,
 * а многоточием обрывается заголовок, а не они. Своя колонка под лейблы
 * растянулась бы по самому длинному набору и сжала заголовки у всех строк.
 */
export const titleCell = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  minWidth: 0,
  '@media': {
    // На телефоне ячейки нет: заголовок уезжает наверх, а лейблы встают
    // в общий ряд меток, а не отдельным рядом под заголовком.
    [media.phone]: { display: 'contents' }
  }
})

export const title = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '@media': {
    // Целая строка под себя и два ряда текста: на телефоне заголовок —
    // единственное, что читают, и обрывать его многоточием жалко.
    [media.phone]: {
      order: -1,
      flexBasis: '100%',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      whiteSpace: 'normal',
      textOverflow: 'clip',
      lineHeight: 1.35
    }
  }
})

export const closed = style({ color: vars.color.muted })

/** Исполнитель — своя колонка: у большинства задач она пустая. */
export const assignee = style({
  justifySelf: 'end',
  fontSize: vars.text.sm,
  color: vars.color.faint,
  '@media': {
    // В колонке пустое место незаметно, в строке метками — это лишний
    // промежуток посреди ряда.
    [media.phone]: { selectors: { '&:empty': { display: 'none' } } }
  }
})

/** Ячейка под признак блокировки: у большинства задач она пустая. */
export const flag = style({
  '@media': {
    [media.phone]: { selectors: { '&:empty': { display: 'none' } } }
  }
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
  background: vars.color.card,
  '@media': {
    // Поля карточки на телефоне другие — отрицательные поля обязаны совпасть
    // с ними, иначе строки поедут сквозь заголовок по краям.
    [media.phone]: {
      marginInline: `calc(-1 * ${vars.space[2]})`,
      padding: `${vars.space[1]} ${vars.space[2]} ${vars.space[2]}`
    }
  }
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

/**
 * Выбранное всплывает над списком, поэтому это тёмный остров, как
 * подсказка с клавишами, — только по центру: подсказка занимает угол.
 */
export const picked = style({
  position: 'fixed',
  left: '50%',
  bottom: vars.space[4],
  transform: 'translateX(-50%)',
  zIndex: 20,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[1],
  padding: `${vars.space[1]} ${vars.space[1]} ${vars.space[1]} ${vars.space[4]}`,
  borderRadius: vars.radius.pill,
  background: vars.color.island,
  color: vars.color.islandText,
  boxShadow: vars.shadow.raise,
  whiteSpace: 'nowrap',
  '@media': {
    // По центру остров шире телефона: там он встаёт от края до края.
    [media.phone]: {
      left: vars.space[3],
      right: vars.space[3],
      transform: 'none',
      justifyContent: 'space-between',
      gap: 0,
      paddingLeft: vars.space[3]
    }
  }
})

/** Высота острова вместе с отступом от края экрана. */
export const pickedRoom = style({ height: '64px' })

export const pickedCount = style({
  marginRight: vars.space[2],
  fontSize: vars.text.sm,
  fontWeight: 600
})

export const islandAction = style([
  press,
  focusRing,
  {
    height: '32px',
    padding: `0 ${vars.space[3]}`,
    borderRadius: vars.radius.pill,
    background: 'transparent',
    color: vars.color.islandFaint,
    fontSize: vars.text.sm,
    fontWeight: 500,
    '@media': { [media.phone]: { padding: `0 ${vars.space[2]}` } },
    selectors: {
      '&:hover': { color: vars.color.islandText }
    }
  }
])
