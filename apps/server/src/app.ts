import {
  type FilterProblem,
  type IssueFilters,
  issueFiltersSchema,
  issueStatusSchema
} from '@beadle/protocol'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'

import { BdError } from './bd.ts'
import { fingerprint, type LiveSetup, readLiveSetup } from './changes.ts'
import {
  applyFilters,
  indexById,
  isIssueId,
  readIssue,
  readIssues,
  toView
} from './issues.read.ts'
import { readStatuses } from './statuses.read.ts'
import { findWorkspace, listWorkspaces } from './workspaces.ts'

/**
 * Карта маршрутов. Воркспейс — часть пути, а не состояние сервера: два
 * клиента с разными проектами не влияют друг на друга, и ссылка на доску
 * открывает ровно ту доску, на которую её дали.
 */

/** Список в адресе — через запятую: `?status=open,in_progress`. */
function parseList(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined
  }
  const items = value.split(',').filter(Boolean)
  return items.length > 0 ? items : undefined
}

type ParsedFilters =
  | { ok: true; filters: IssueFilters }
  | { ok: false; fields: FilterProblem[] }

/**
 * Разбор фильтров из адреса. Нераспознанное значение — отказ, а не пропуск:
 * адрес здесь описывает состояние экрана целиком, и показать список, тихо
 * выбросив непонятную часть адреса, значит соврать о том, что человек видит.
 *
 * Статусы сверяются со словарём проекта: у каждого проекта свои, и общего
 * перечисления, по которому проверить, нет.
 *
 * @param statuses Допустимые в проекте статусы.
 */
export function parseFilters(
  query: Record<string, string>,
  statuses: ReadonlySet<string>
): ParsedFilters {
  const schema = issueFiltersSchema.extend({
    status: z
      .array(
        issueStatusSchema.refine((name) => statuses.has(name), {
          error: (issue) => `статуса «${String(issue.input)}» в проекте нет`
        })
      )
      .optional()
  })

  const parsed = schema.safeParse({
    status: parseList(query['status']),
    type: parseList(query['type']),
    priority: parseList(query['priority'])?.map(Number),
    label: parseList(query['label']),
    assignee: query['assignee'] || undefined,
    parent: query['parent'] || undefined,
    search: query['search'] || undefined,
    ready: query['ready'] || undefined
  })

  if (parsed.success) {
    return { ok: true, filters: parsed.data }
  }

  return {
    ok: false,
    fields: parsed.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message
    }))
  }
}

/** Как часто смотреть на выгрузку. `stat` бесплатен: процесс не запускается. */
const POLL_MS = 1000

/** Молчание дольше этого посредники принимают за обрыв. */
const HEARTBEAT_MS = 25_000

/**
 * Отдаёт собранный фронт по пути в адресе. В разработке его нет: страницы
 * раздаёт vite. В одном бинаре — есть, и лежит он внутри самого файла.
 */
export type WebHandler = (pathname: string) => Response | undefined

export function createApp(web?: WebHandler) {
  const app = new Hono()

  app.get('/health', (c) => c.json({ ok: true }))

  app.get('/api/workspaces', (c) => c.json({ workspaces: listWorkspaces() }))

  app.get('/api/w/:slug/issues', async (c) => {
    const workspace = findWorkspace(c.req.param('slug'))
    if (!workspace) {
      return c.json({ error: 'workspace_not_found' }, 404)
    }

    try {
      // Словарь и задачи читаются разом, а не по очереди: без словаря
      // статус в адресе не проверить, а ждать два вызова `bd` подряд
      // пришлось бы на каждом запросе. Отказ по фильтру редок — чтение
      // задач впустую в этом случае дешевле.
      const [statuses, issues] = await Promise.all([
        readStatuses(workspace.path),
        readIssues(workspace.path)
      ])

      // Допустим и статус, который есть у задач, но пропал из словаря:
      // его убрали из конфига, а задачи остались, и отобрать их всё равно
      // должно быть можно.
      const known = new Set([
        ...statuses.map((status) => status.name),
        ...issues.map((issue) => issue.status)
      ])
      const filters = parseFilters(c.req.query(), known)
      if (!filters.ok) {
        return c.json({ error: 'bad_filters', fields: filters.fields }, 400)
      }

      const byId = indexById(issues)

      // Сначала вид, потом отбор: «готово к работе» спрашивает про
      // держателей, а их видно только по целому графу.
      const views = issues.map((issue) => toView(issue, byId))

      return c.json({ workspace, issues: applyFilters(views, filters.filters) })
    } catch (error) {
      if (error instanceof BdError) {
        return c.json({ error: 'bd_failed', message: error.message }, 502)
      }
      throw error
    }
  })

  app.get('/api/w/:slug/statuses', async (c) => {
    const workspace = findWorkspace(c.req.param('slug'))
    if (!workspace) {
      return c.json({ error: 'workspace_not_found' }, 404)
    }

    try {
      return c.json({ workspace, statuses: await readStatuses(workspace.path) })
    } catch (error) {
      if (error instanceof BdError) {
        return c.json({ error: 'bd_failed', message: error.message }, 502)
      }
      throw error
    }
  })

  /**
   * Поток новостей о проекте. Соединение держит один клиент и одна вкладка:
   * состояния на сервере нет, как и везде здесь, — какой проект слушать,
   * сказано в адресе.
   */
  app.get('/api/w/:slug/events', async (c) => {
    const workspace = findWorkspace(c.req.param('slug'))
    if (!workspace) {
      return c.json({ error: 'workspace_not_found' }, 404)
    }

    let setup: LiveSetup
    try {
      setup = await readLiveSetup(workspace.path)
    } catch (error) {
      if (error instanceof BdError) {
        return c.json({ error: 'bd_failed', message: error.message }, 502)
      }
      throw error
    }

    return streamSSE(c, async (stream) => {
      // Первым делом — можно ли вообще следить: страница, которая не будет
      // обновляться, обязана сказать об этом сразу, а не притворяться живой.
      await stream.writeSSE({
        event: 'ready',
        data: JSON.stringify(
          setup.live
            ? { live: true, interval: setup.interval }
            : { live: false }
        )
      })
      if (!setup.live) {
        return
      }

      let seen = await fingerprint(setup.file)
      let idle = 0

      // Опрос последователен по своей природе: следующий взгляд на файл
      // имеет смысл только после предыдущего, а совет правила собрать
      // обещания и подождать все разом превратил бы ожидание в busy loop.
      /* oxlint-disable no-await-in-loop */
      while (!stream.aborted && !stream.closed) {
        await stream.sleep(POLL_MS)
        const now = await fingerprint(setup.file)

        if (now !== seen) {
          seen = now
          idle = 0
          await stream.writeSSE({ event: 'changed', data: now })
          continue
        }

        idle += POLL_MS
        if (idle >= HEARTBEAT_MS) {
          idle = 0
          // Пустое сообщение — чтобы посредник не счёл молчание обрывом.
          await stream.writeSSE({ event: 'ping', data: '' })
        }
      }
      /* oxlint-enable no-await-in-loop */
    })
  })

  app.get('/api/w/:slug/issues/:id', async (c) => {
    const workspace = findWorkspace(c.req.param('slug'))
    if (!workspace) {
      return c.json({ error: 'workspace_not_found' }, 404)
    }

    const id = c.req.param('id')
    if (!isIssueId(id)) {
      return c.json({ error: 'bad_issue_id' }, 400)
    }

    try {
      const issue = await readIssue(workspace.path, id)
      if (!issue) {
        return c.json({ error: 'issue_not_found' }, 404)
      }
      return c.json({ workspace, issue })
    } catch (error) {
      if (error instanceof BdError) {
        return c.json({ error: 'bd_failed', message: error.message }, 502)
      }
      throw error
    }
  })

  if (web) {
    /*
     * Всё, что не разобрал API, — это страница, и разбирать её будет
     * браузер: адрес здесь описывает экран целиком, поэтому по прямой
     * ссылке на доску сервер обязан отдать приложение, а не 404.
     *
     * Кроме самого API: непопадание в его маршрут — ошибка запроса,
     * и отвечать на неё страницей значит прятать её от того, кто
     * ошибся адресом.
     */
    app.get('*', (c) => {
      const { pathname } = new URL(c.req.url)
      if (pathname.startsWith('/api/')) {
        return c.notFound()
      }
      return web(pathname) ?? c.notFound()
    })
  }

  return app
}
