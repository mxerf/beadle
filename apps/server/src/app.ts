import { issueFiltersSchema } from '@beadle/protocol'
import { Hono } from 'hono'

import { BdError } from './bd.ts'
import {
  applyFilters,
  indexById,
  isBlocked,
  readIssues
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

function parseFilters(query: Record<string, string>) {
  return issueFiltersSchema.parse({
    status: parseList(query['status']),
    type: parseList(query['type']),
    priority: parseList(query['priority'])?.map(Number),
    label: parseList(query['label']),
    assignee: query['assignee'] || undefined,
    parent: query['parent'] || undefined,
    search: query['search'] || undefined
  })
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

    try {
      const issues = await readIssues(workspace.path)
      const byId = indexById(issues)
      const filtered = applyFilters(issues, parseFilters(c.req.query()))

      return c.json({
        workspace,
        issues: filtered.map((issue) => ({
          ...issue,
          blocked: isBlocked(issue, byId)
        }))
      })
    } catch (error) {
      if (error instanceof BdError) {
        return c.json({ error: 'bd_failed', message: error.message }, 502)
      }
      throw error
    }
  })

  return app
}
