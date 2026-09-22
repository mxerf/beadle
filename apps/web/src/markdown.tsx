import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import * as styles from './markdown.css.ts'

/**
 * Разметка в описаниях задач. Сырой HTML не включаем: текст приходит
 * из чужого репозитория, и читалка не должна исполнять то, что в нём лежит.
 * `remark-gfm` — ради таблиц и списков-чеклистов, они в описаниях обычны.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className={styles.body}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
