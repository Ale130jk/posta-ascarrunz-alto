import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'inverse'
  | 'ghost'
  | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  className?: string
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-800 active:bg-brand-900',
  secondary:
    'border border-brand-100 bg-brand-50 text-brand-900 hover:border-brand-200 hover:bg-brand-100',
  outline:
    'border border-line bg-paper text-ink hover:border-brand-300 hover:bg-brand-50',
  inverse:
    'border border-white/20 bg-transparent text-white hover:border-white/35 hover:bg-white/10',
  ghost: 'text-ink/65 hover:bg-sand hover:text-ink',
  danger:
    'bg-red-600 text-white shadow-sm shadow-red-900/10 hover:bg-red-700 active:bg-red-800',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-3.5 text-xs',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2.5 px-6 text-sm',
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  full = false,
  className,
}: ButtonStyleOptions = {}): string {
  return clsx(
    'inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    full && 'w-full',
    className,
  )
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleOptions {
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, full, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
