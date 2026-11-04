import clsx from 'clsx'
import type { DoctorColor } from '../../types'
import { DOCTOR_COLORS } from '../../lib/constants'
import { initials } from '../../lib/names'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-9 w-9 text-[11px]',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

interface AvatarProps {
  firstName: string
  lastName?: string
  color?: DoctorColor
  size?: AvatarSize
  className?: string
}

export function Avatar({
  firstName,
  lastName,
  color = 'teal',
  size = 'md',
  className,
}: AvatarProps) {
  const palette =
    DOCTOR_COLORS.find((item) => item.value === color) ?? DOCTOR_COLORS[0]
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide ring-2 ring-white',
        palette.avatar,
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(firstName, lastName)}
    </span>
  )
}
