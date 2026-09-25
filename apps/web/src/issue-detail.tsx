import type { IssueDetail, IssueLink } from '@beadle/protocol'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import {
  formatDate,
  formatDuration,
  priorityCaption,
  priorityTone,
  typeCaption
} from './captions.ts'
import { CopyId } from './copy-id.tsx'
import * as styles from './issue-detail.css.ts'
import { Markdown } from './markdown.tsx'
import { StatusTag } from './status-tag.tsx'
import * as tag from './tag.css.ts'

/**
 * Полный расклад по задаче: текст слева, обстановка и связи справа.
 * Связи разобраны по типу ребра — `bd` кладёт в `dependencies` и `dependents`
 * и родителя, и блокировки, различая их полем `dependency_type`.
 */
export function IssueDetail({
  slug,
  issue
}: {
  slug: string
  issue: IssueDetail
}) {
  const parent = issue.dependencies.find(
    (link) => link.dependency_type === 'parent-child'
  )
  const waitsFor = issue.dependencies.filter(
    (link) => link.dependency_type === 'blocks'
  )
  const children = issue.dependents.filter(
    (link) => link.dependency_type === 'parent-child'
  )
  const holds = issue.dependents.filter(
    (link) => link.dependency_type === 'blocks'
  )
  const related = [...issue.dependencies, ...issue.dependents].filter(
    (link) =>
      link.dependency_type !== 'parent-child' &&
      link.dependency_type !== 'blocks'
  )

  return (
    <>
      <header className={styles.head}>
        <CopyId id={issue.id} />
        <h1 className={styles.title}>{issue.title}</h1>
        <div className={styles.tags}>
          <span className={tag.tone[priorityTone(issue.priority)]}>
            {priorityCaption(issue.priority)}
          </span>
          <span className={tag.tone.quiet}>
            {typeCaption[issue.issue_type]}
          </span>
          <StatusTag status={issue.status} />
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <Text title="Описание" text={issue.description} />
          <Text title="Замысел" text={issue.design} />
          <Text title="Критерии приёмки" text={issue.acceptance_criteria} />
          <Text title="Заметки" text={issue.notes} />
          <Text title="Почему закрыта" text={issue.close_reason} />

          {children.length > 0 ? (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                Подзадачи
                <span className={styles.progress}>
                  закрыто {children.filter((c) => c.status === 'closed').length}{' '}
                  из {children.length}
                </span>
              </h2>
              <Links slug={slug} links={children} />
            </section>
          ) : null}

          {issue.comments.length > 0 ? (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                Обсуждение ({issue.comments.length})
              </h2>
              {issue.comments.map((comment) => (
                <article key={comment.id} className={styles.comment}>
                  <div className={styles.commentHead}>
                    <span className={styles.commentAuthor}>
                      {comment.author}
                    </span>
                    <span className={styles.commentDate}>
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <Markdown>{comment.text}</Markdown>
                </article>
              ))}
            </section>
          ) : null}
        </div>

        <aside className={styles.aside}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Обстановка</h2>
            <Field name="Исполнитель" value={issue.assignee} />
            <Field name="Владелец" value={issue.owner} />
            <Field name="Завёл" value={issue.created_by} />
            <Field name="Создана" value={formatDate(issue.created_at)} />
            <Field name="Обновлена" value={formatDate(issue.updated_at)} />
            <Field
              name="В работе с"
              value={issue.started_at && formatDate(issue.started_at)}
            />
            <Field
              name="Закрыта"
              value={issue.closed_at && formatDate(issue.closed_at)}
            />
            <Field
              name="Срок"
              value={issue.due_at && formatDate(issue.due_at)}
            />
            <Field
              name="Оценка"
              value={
                issue.estimated_minutes === undefined
                  ? undefined
                  : formatDuration(issue.estimated_minutes)
              }
            />
            {issue.labels.length > 0 ? (
              <div className={styles.labels}>
                {issue.labels.map((label) => (
                  <span key={label} className={tag.tone.neutral}>
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <Relations
            slug={slug}
            title="Родитель"
            links={parent ? [parent] : []}
          />
          <Relations slug={slug} title="Ждёт" links={waitsFor} />
          <Relations slug={slug} title="Держит" links={holds} />
          <Relations slug={slug} title="Связанные" links={related} />
        </aside>
      </div>
    </>
  )
}

function Text({ title, text }: { title: string; text: string | undefined }) {
  if (!text) {
    return null
  }
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <Markdown>{text}</Markdown>
    </section>
  )
}

function Field({ name, value }: { name: string; value: string | undefined }) {
  if (!value) {
    return null
  }
  return (
    <div className={styles.field}>
      <span className={styles.fieldName}>{name}</span>
      <span>{value}</span>
    </div>
  )
}

function Relations({
  slug,
  title,
  links
}: {
  slug: string
  title: string
  links: readonly IssueLink[]
}): ReactNode {
  if (links.length === 0) {
    return null
  }
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <Links slug={slug} links={links} stacked />
    </section>
  )
}

function Links({
  slug,
  links,
  stacked = false
}: {
  slug: string
  links: readonly IssueLink[]
  stacked?: boolean
}) {
  return (
    <div>
      {links.map((link) => {
        const priority = (
          <span className={tag.tone[priorityTone(link.priority)]}>
            {priorityCaption(link.priority)}
          </span>
        )
        const status = <StatusTag status={link.status} />
        const number = <span className={styles.linkId}>{link.id}</span>

        return (
          <Link
            key={link.id}
            to="/w/$slug/issue/$id"
            params={{ slug, id: link.id }}
            className={stacked ? styles.linkStacked : styles.link}
          >
            {stacked ? (
              <>
                <span className={styles.linkMeta}>
                  {priority}
                  {status}
                  {number}
                </span>
                <span className={styles.linkWrapped}>{link.title}</span>
              </>
            ) : (
              <>
                {priority}
                <span className={styles.linkTitle} title={link.title}>
                  {link.title}
                </span>
                {status}
                {number}
              </>
            )}
          </Link>
        )
      })}
    </div>
  )
}
