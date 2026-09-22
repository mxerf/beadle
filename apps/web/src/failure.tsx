import { ApiError } from './api.ts'
import { failureCaption } from './captions.ts'
import * as styles from './failure.css.ts'
import { Notice } from './notice.tsx'

/**
 * Отказ сервера объясняется человеку, а не показывается кодом. Нечитаемый
 * фильтр в адресе — не тупик: из него должен быть выход одним щелчком,
 * потому что ссылка могла прийти из закладки или переписки и устареть
 * вместе со словарём статусов beads.
 */
export function Failure({
  error,
  onReset
}: {
  error: Error
  onReset: () => void
}) {
  const failure = error instanceof ApiError ? error : undefined
  const caption = failure ? failureCaption[failure.code] : undefined
  const detail = failure?.fields.length
    ? failure.fields
        .map((field) => `${field.path}: ${field.message}`)
        .join('; ')
    : undefined

  return (
    <Notice tone="failure" hint={detail ?? failure?.message}>
      <div className={styles.row}>
        <span>{caption ?? error.message}</span>
        {failure?.code === 'bad_filters' ? (
          <button className={styles.action} type="button" onClick={onReset}>
            Показать все задачи
          </button>
        ) : null}
      </div>
    </Notice>
  )
}
