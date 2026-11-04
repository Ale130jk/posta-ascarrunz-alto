import { Baby, HeartPulse, Smile, Stethoscope } from 'lucide-react'
import clsx from 'clsx'

const icons = {
  stethoscope: Stethoscope,
  baby: Baby,
  heart: HeartPulse,
  smile: Smile,
}

export function ServiceIcon({
  name,
  className,
}: {
  name: keyof typeof icons
  className?: string
}) {
  const Icon = icons[name]
  return <Icon className={clsx('h-5 w-5', className)} aria-hidden="true" />
}
