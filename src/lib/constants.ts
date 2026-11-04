import type { DoctorColor, Weekday } from '../types'

export const CLINIC = {
  name: 'Posta Médica Ascarrunz Alto',
  shortName: 'Ascarrunz Alto',
  district: 'San Juan de Lurigancho',
  city: 'Lima, Perú',
  address: 'Av. Ascarrunz Alto s/n, San Juan de Lurigancho, Lima',
  phone: '(01) 555 0184',
  mobile: '920 000 145',
  email: 'citas@postaascarrunz.pe',
  hours: 'Lunes a sábado · 9:00 a. m. a 6:00 p. m.',
  hoursShort: 'Lun – Sáb · 9:00 – 18:00',
  timezone: 'America/Lima',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Ascarrunz+Alto+San+Juan+de+Lurigancho+Lima',
  adminEmail: 'admin@postaascarrunz.pe',
  adminPassword: 'Ascarrunz2026',
} as const

export const APPOINTMENT_MINUTES = 30
export const BOOKING_HORIZON_DAYS = 60
export const CANCEL_NOTICE_HOURS = 24
export const CLINIC_OPEN_MINUTES = 9 * 60
export const CLINIC_CLOSE_MINUTES = 18 * 60
export const CLINIC_OPEN_TIME = '09:00'
export const CLINIC_CLOSE_TIME = '18:00'

export const SPECIALTIES = [
  'Medicina General',
  'Pediatría',
  'Obstetricia',
  'Odontología',
  'Enfermería',
  'Nutrición',
] as const

export const WEEKDAYS: { value: Weekday; label: string; short: string }[] = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

export const SERVICES = [
  {
    id: 'medicina-general',
    name: 'Medicina general',
    specialty: 'Medicina General',
    description:
      'Evaluación integral, control de enfermedades crónicas y orientación para tu cuidado diario.',
    icon: 'stethoscope' as const,
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    specialty: 'Pediatría',
    description:
      'Control de niño sano, seguimiento del crecimiento y atención de consultas frecuentes.',
    icon: 'baby' as const,
  },
  {
    id: 'obstetricia',
    name: 'Obstetricia',
    specialty: 'Obstetricia',
    description:
      'Control prenatal, planificación familiar y acompañamiento en la salud de la mujer.',
    icon: 'heart' as const,
  },
  {
    id: 'odontologia',
    name: 'Odontología',
    specialty: 'Odontología',
    description:
      'Evaluación bucal, limpieza dental y tratamientos preventivos para toda la familia.',
    icon: 'smile' as const,
  },
]

export const DOCTOR_COLORS: {
  value: DoctorColor
  label: string
  swatch: string
  avatar: string
  soft: string
  dot: string
}[] = [
  {
    value: 'teal',
    label: 'Verde azulado',
    swatch: 'bg-teal-600',
    avatar: 'bg-teal-100 text-teal-800',
    soft: 'bg-teal-50',
    dot: 'bg-teal-500',
  },
  {
    value: 'rose',
    label: 'Rosa',
    swatch: 'bg-rose-500',
    avatar: 'bg-rose-100 text-rose-800',
    soft: 'bg-rose-50',
    dot: 'bg-rose-500',
  },
  {
    value: 'amber',
    label: 'Ámbar',
    swatch: 'bg-amber-500',
    avatar: 'bg-amber-100 text-amber-800',
    soft: 'bg-amber-50',
    dot: 'bg-amber-500',
  },
  {
    value: 'sky',
    label: 'Celeste',
    swatch: 'bg-sky-500',
    avatar: 'bg-sky-100 text-sky-800',
    soft: 'bg-sky-50',
    dot: 'bg-sky-500',
  },
  {
    value: 'emerald',
    label: 'Esmeralda',
    swatch: 'bg-emerald-600',
    avatar: 'bg-emerald-100 text-emerald-800',
    soft: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  {
    value: 'violet',
    label: 'Violeta',
    swatch: 'bg-violet-500',
    avatar: 'bg-violet-100 text-violet-800',
    soft: 'bg-violet-50',
    dot: 'bg-violet-500',
  },
]

export const STATUS_LABELS = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Atendida',
} as const
