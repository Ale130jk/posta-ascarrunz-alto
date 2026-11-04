import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import clsx from 'clsx'

interface FieldExtras {
  label: string
  error?: string
  hint?: string
  required?: boolean
  containerClassName?: string
}

const baseControl =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-ink/35 transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink/50'
const validControl =
  'border-line focus:border-brand-500 focus:ring-brand-500/10'
const invalidControl =
  'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/10'

function Label({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string
  label: string
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink"
    >
      {label}
      {required && (
        <span className="text-brand-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

function Messages({
  id,
  error,
  hint,
}: {
  id: string
  error?: string
  hint?: string
}) {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink/55">
        {hint}
      </p>
    )
  }
  return null
}

export function TextField({
  label,
  error,
  hint,
  required,
  containerClassName,
  id,
  className,
  ...props
}: FieldExtras & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div className={containerClassName}>
      <Label htmlFor={fieldId} label={label} required={required} />
      <input
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={clsx(
          baseControl,
          'h-11',
          error ? invalidControl : validControl,
          className,
        )}
        {...props}
      />
      <Messages id={fieldId} error={error} hint={hint} />
    </div>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  required,
  containerClassName,
  id,
  className,
  rows = 4,
  ...props
}: FieldExtras & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div className={containerClassName}>
      <Label htmlFor={fieldId} label={label} required={required} />
      <textarea
        id={fieldId}
        required={required}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={clsx(
          baseControl,
          'resize-y py-3 leading-6',
          error ? invalidControl : validControl,
          className,
        )}
        {...props}
      />
      <Messages id={fieldId} error={error} hint={hint} />
    </div>
  )
}

export function SelectField({
  label,
  error,
  hint,
  required,
  containerClassName,
  id,
  className,
  children,
  ...props
}: FieldExtras & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div className={containerClassName}>
      <Label htmlFor={fieldId} label={label} required={required} />
      <select
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={clsx(
          baseControl,
          'h-11 cursor-pointer appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10',
          error ? invalidControl : validControl,
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7673' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
      <Messages id={fieldId} error={error} hint={hint} />
    </div>
  )
}
