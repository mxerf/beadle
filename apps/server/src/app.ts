import {
  type FilterProblem,
  type IssueFilters,
  issueFiltersSchema
} from '@beadle/protocol'
import { Hono } from 'hono'

import { BdError } from './bd.ts'
import {
  applyFilters,
  indexById,
  readIssue,
  readIssues,
  toView
} from './issues.read.ts'
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
 */
export function parseFilters(query: Record<string, string>): ParsedFilters {
  const parsed = issueFiltersSchema.safeParse({
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

export function createApp() {
  const app = new Hono()

  app.get('/health', (c) => c.json({ ok: true }))

  app.get('/api/workspaces', (c) => c.json({ workspaces: listWorkspaces() }))

  app.get('/api/w/:slug/issues', async (c) => {
    const workspace = findWorkspace(c.req.param('slug'))
    if (!workspace) {
      return c.json({ error: 'workspace_not_found' }, 404)
    }

    // Фильтры разбираются до обращения к bd: читать весь проект ради
    // запроса, на который всё равно ответим отказом, незачем.
    const filters = parseFilters(c.req.query())
    if (!filters.ok) {
      return c.json({ error: 'bad_filters', fields: filters.fields }, 400)
    }

    try {
      const issues = await readIssues(workspace.path)
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

  app.get('/api/w/:slug/issues/:id', async (c) => {
    const workspace = findWorkspace(c.req.param('slug'))
    if (!workspace) {
      return c.json({ error: 'workspace_not_found' }, 404)
    }

    try {
      const issue = await readIssue(workspace.path, c.req.param('id'))
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

  return app
}
