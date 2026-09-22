import { describe, expect, it } from 'vitest'

import {
  issueSearchSchema,
  parseSearch,
  stringifySearch,
  toggleValue,
  toQueryString,
  toValues
} from './search.ts'

describe('toValues', () => {
  it('отсутствие параметра — пустой список, а не список из пустой строки', () => {
    expect(toValues(undefined)).toEqual([])
    expect(toValues('')).toEqual([])
  })

  it('делит список по запятой', () => {
    expect(toValues('open,in_progress')).toEqual(['open', 'in_progress'])
  })

  it('выбрасывает пустые куски правленого руками адреса', () => {
    expect(toValues('open,,closed,')).toEqual(['open', 'closed'])
  })
})

describe('toggleValue', () => {
  it('добавляет значение в пустой фильтр', () => {
    expect(toggleValue(undefined, 'open')).toBe('open')
  })

  it('дописывает значение к уже выбранным', () => {
    expect(toggleValue('open', 'closed')).toBe('open,closed')
  })

  it('снимает выбранное значение', () => {
    expect(toggleValue('open,closed', 'open')).toBe('closed')
  })

  it('снятие последнего убирает параметр, а не оставляет пустой', () => {
    expect(toggleValue('open', 'open')).toBeUndefined()
  })
})

describe('toQueryString', () => {
  it('пропускает незаполненные фильтры', () => {
    expect(toQueryString({ status: 'open', search: undefined })).toBe(
      'status=open'
    )
  })

  it('кодирует кириллицу в поиске', () => {
    expect(toQueryString({ search: 'мониторинг' })).toBe(
      'search=%D0%BC%D0%BE%D0%BD%D0%B8%D1%82%D0%BE%D1%80%D0%B8%D0%BD%D0%B3'
    )
  })

  it('сохраняет запятые в списках читаемыми', () => {
    expect(toQueryString({ priority: '0,1' })).toBe('priority=0%2C1')
  })

  // Молчаливая штука: если показ утечёт в запрос, ключ кеша поедет вместе
  // с ним, и каждая перегруппировка станет новым походом к `bd`.
  it('не пускает в запрос то, что относится к показу, а не к отбору', () => {
    expect(toQueryString({ status: 'open', group: 'epic' })).toBe('status=open')
  })
})

describe('issueSearchSchema', () => {
  it('принимает число: маршрутизатор отдаёт `?priority=0` числом', () => {
    expect(issueSearchSchema.parse({ priority: 0 })).toEqual({ priority: '0' })
  })

  it('оставляет список строкой: JSON его не разбирает', () => {
    expect(issueSearchSchema.parse({ priority: '0,1' })).toEqual({
      priority: '0,1'
    })
  })

  it('число в поиске тоже становится строкой', () => {
    expect(issueSearchSchema.parse({ search: 42 })).toEqual({ search: '42' })
  })

  it('пустой адрес остаётся пустым, а не набором «undefined»', () => {
    expect(issueSearchSchema.parse({})).toEqual({})
  })
})

describe('parseSearch', () => {
  /*
   * Ради этого разбор и написан свой. Готовый приводит `1`, `0` и `true`
   * к числу и булеву ещё до всякого разбора, и маршрутизатор потом сравнивает
   * сырое значение из адреса со строковым из ссылки — они не совпадают,
   * и переключатель видов перестаёт подсвечивать текущий вид. Ни типы, ни
   * линт этого не видят: обе стороны законны по отдельности.
   */
  it('не превращает значения, похожие на JSON, в числа и булевы', () => {
    expect(parseSearch('?ready=1')).toEqual({ ready: '1' })
    expect(parseSearch('?priority=0')).toEqual({ priority: '0' })
    expect(parseSearch('?ready=true')).toEqual({ ready: 'true' })
  })

  it('понимает адрес и с вопросительным знаком, и без', () => {
    expect(parseSearch('status=open')).toEqual({ status: 'open' })
    expect(parseSearch('?status=open')).toEqual({ status: 'open' })
  })

  it('пустой адрес — пустой отбор', () => {
    expect(parseSearch('')).toEqual({})
    expect(parseSearch('?')).toEqual({})
  })

  it('раскодирует кириллицу и запятые', () => {
    expect(
      parseSearch('?search=%D1%82%D0%B5%D1%81%D1%82&priority=0,1')
    ).toEqual({ search: 'тест', priority: '0,1' })
  })
})

describe('stringifySearch', () => {
  it('пустой отбор не оставляет в адресе хвоста', () => {
    expect(stringifySearch({})).toBe('')
    expect(stringifySearch({ status: undefined })).toBe('')
  })

  it('оставляет запятые читаемыми', () => {
    expect(stringifySearch({ priority: '0,1' })).toBe('?priority=0,1')
  })

  it('возвращает ровно то, что разобрал', () => {
    for (const query of [
      '?ready=1',
      '?priority=0,1',
      '?status=open&ready=true'
    ]) {
      expect(stringifySearch(parseSearch(query))).toBe(query)
    }
  })
})
