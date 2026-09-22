import { type LiveStatus, liveStatusSchema } from '@beadle/protocol'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

/**
 * Живое обновление: сервер сообщает, что выгрузка задач изменилась, а мы
 * сбрасываем кеш и перечитываем. Обновляется весь проект целиком — и список,
 * и открытая задача: изменение пришло от `bd`, а не от этой вкладки, и какая
 * именно задача поменялась, отсюда не видно.
 *
 * Состояние возвращается наружу, потому что живым обновление бывает не
 * всегда: `bd` кладёт выгрузку только при включённом `export.auto`. Молча
 * показывать устаревающую страницу в этом случае — то же самое, что
 * показывать список под неприменённым фильтром.
 */
export function useLiveUpdates(slug: string): LiveStatus {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LiveStatus>({ live: false })

  useEffect(() => {
    const source = new EventSource(`/api/w/${encodeURIComponent(slug)}/events`)

    function onReady(event: Event): void {
      if (!(event instanceof MessageEvent)) {
        return
      }
      const parsed = liveStatusSchema.safeParse(parse(event.data))
      if (!parsed.success) {
        return
      }
      setStatus(parsed.data)
      // Следить не за чем — соединение держать незачем. Иначе браузер
      // будет переоткрывать его до конца жизни вкладки.
      if (!parsed.data.live) {
        source.close()
      }
    }

    function onChanged(): void {
      void queryClient.invalidateQueries({ queryKey: ['issues', slug] })
      void queryClient.invalidateQueries({ queryKey: ['issue', slug] })
    }

    source.addEventListener('ready', onReady)
    source.addEventListener('changed', onChanged)

    return () => {
      source.close()
    }
  }, [slug, queryClient])

  return status
}

function parse(data: unknown): unknown {
  try {
    return JSON.parse(String(data))
  } catch {
    return undefined
  }
}
