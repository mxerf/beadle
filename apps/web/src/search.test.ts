import { describe, expect, it } from 'vitest'

import {
  issueSearchSchema,
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
