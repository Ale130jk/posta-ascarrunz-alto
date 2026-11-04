import clsx from 'clsx'

interface BrandProps {
  inverted?: boolean
  className?: string
  compact?: boolean
}

export function Brand({ inverted = false, className, compact = false }: BrandProps) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <span
        className={clsx(
          'relative grid place-items-center rounded-[14px] shadow-sm',
          compact ? 'h-9 w-9' : 'h-11 w-11',
          inverted ? 'bg-white text-brand-800' : 'bg-brand-700 text-white',
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className={compact ? 'h-5 w-5' : 'h-6 w-6'}
          fill="currentColor"
        >
          <path d="M9.2 3.8h5.6v5.4h5.4v5.6h-5.4v5.4H9.2v-5.4H3.8V9.2h5.4z" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-400 ring-2 ring-paper" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            'text-[9px] font-extrabold uppercase tracking-[0.2em]',
            inverted ? 'text-white/55' : 'text-brand-700/65',
          )}
        >
          Posta médica
        </span>
        <span
          className={clsx(
            'font-display font-semibold tracking-[-0.02em]',
            compact ? 'mt-0.5 text-lg' : 'mt-1 text-[1.35rem]',
            inverted ? 'text-white' : 'text-ink',
          )}
        >
          Ascarrunz Alto
        </span>
      </span>
    </span>
  )
}
