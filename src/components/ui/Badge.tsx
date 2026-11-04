import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { AppointmentStatus } from '../../types'
import { STATUS_LABELS } from '../../lib/constants'

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  completed: 'border-sky-200 bg-sky-50 text-sky-700',
}

const statusDots: Record<AppointmentStatus, string> = {
  confirmed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  completed: 'bg-sky-500',
}

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus
  className?: string
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        statusStyles[status],
        className,
      )}
    >
      <span
        className={clsx('h-1.5 w-1.5 rounded-full', statusDots[status])}
        aria-hidden="true"
      />
      {STATUS_LABELS[status]}
    </span>
  )
}

type Tone = 'brand' | 'neutral' | 'green' | 'amber' | 'red' | 'sky'

const tones: Record<Tone, string> = {
  brand: 'border-brand-200 bg-brand-50 text-brand-800',
  neutral: 'border-line bg-sand text-ink/65',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-red-200 bg-red-50 text-red-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
}

export function Pill({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
