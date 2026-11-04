import type { ReactNode } from 'react'
import clsx from 'clsx'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
          {title}
        </h1>
        {description && (
          <div className="mt-2 text-sm leading-6 text-ink/60">{description}</div>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  light?: boolean
}) {
  return (
    <div
      className={clsx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
      )}
    >
      <p
        className={clsx(
          'mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em]',
          light ? 'text-brand-200' : 'text-brand-700',
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={clsx(
          'font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl',
          light ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={clsx(
            'mt-4 text-base leading-7',
            light ? 'text-white/65' : 'text-ink/60',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}

const statTones = {
  brand: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  rose: 'bg-rose-50 text-rose-700',
  emerald: 'bg-emerald-50 text-emerald-700',
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
}: {
  label: string
  value: ReactNode
  hint?: string
  icon: ReactNode
  tone?: keyof typeof statTones
}) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-ink/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">
          {label}
        </p>
        <span
          className={clsx(
            'grid h-9 w-9 place-items-center rounded-xl',
            statTones[tone],
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </article>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-sand/40 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-ink/55">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
