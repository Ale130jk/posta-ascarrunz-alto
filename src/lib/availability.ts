import type { Appointment, ScheduleBlock, Slot, Weekday } from '../types'
import {
  APPOINTMENT_MINUTES,
  BOOKING_HORIZON_DAYS,
  WEEKDAYS,
  WEEKDAY_LABELS,
} from './constants'
import {
  addDaysISO,
  daysFromToday,
  formatShortDate,
  formatTime12,
  isPastDateTime,
  minutesToTime,
  parseLocalDate,
  timeToMinutes,
  todayISO,
  weekdayOf,
} from './dates'

export interface AvailabilityQuery {
  schedules: ScheduleBlock[]
  appointments: Appointment[]
  doctorId: string
  dateISO: string
  ignoreAppointmentId?: string
}

function overlaps(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB
}

export function getAvailableSlots(query: AvailabilityQuery): Slot[] {
  const { schedules, appointments, doctorId, dateISO, ignoreAppointmentId } = query
  const weekday = weekdayOf(dateISO) as Weekday
  const blocks = schedules.filter(
    (block) => block.doctorId === doctorId && block.weekday === weekday,
  )
  const booked = appointments.filter(
    (appointment) =>
      appointment.doctorId === doctorId &&
      appointment.date === dateISO &&
      appointment.status === 'confirmed' &&
      appointment.id !== ignoreAppointmentId,
  )

  const slots: Slot[] = []
  const seen = new Set<string>()

  for (const block of blocks) {
    const blockStart = timeToMinutes(block.start)
    const blockEnd = timeToMinutes(block.end)
    for (
      let cursor = blockStart;
      cursor + APPOINTMENT_MINUTES <= blockEnd;
      cursor += APPOINTMENT_MINUTES
    ) {
      const start = minutesToTime(cursor)
      const end = minutesToTime(cursor + APPOINTMENT_MINUTES)
      if (seen.has(start)) continue
      if (isPastDateTime(dateISO, start)) continue

      const overlapsBooking = booked.some((appointment) =>
        overlaps(
          cursor,
          cursor + APPOINTMENT_MINUTES,
          timeToMinutes(appointment.start),
          timeToMinutes(appointment.end),
        ),
      )
      if (overlapsBooking) continue

      seen.add(start)
      slots.push({ start, end })
    }
  }

  return slots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
}

export function getDayAvailabilityCount(query: AvailabilityQuery): number {
  return getAvailableSlots(query).length
}

export interface NextSlot {
  date: string
  start: string
  end: string
}

export function getNextAvailableSlot(
  base: Omit<AvailabilityQuery, 'dateISO'>,
  fromISO = todayISO(),
  days = BOOKING_HORIZON_DAYS,
): NextSlot | null {
  for (let offset = 0; offset <= days; offset += 1) {
    const dateISO = addDaysISO(fromISO, offset)
    const slots = getAvailableSlots({ ...base, dateISO })
    if (slots.length > 0) {
      return { date: dateISO, ...slots[0] }
    }
  }
  return null
}

export interface AvailabilityStatus {
  label: string
  tone: 'available' | 'soon' | 'none'
}

export function getDoctorAvailabilityStatus(
  base: Omit<AvailabilityQuery, 'dateISO'>,
  doctorId: string,
): AvailabilityStatus {
  const today = todayISO()
  const todayCount = getDayAvailabilityCount({ ...base, doctorId, dateISO: today })
  if (todayCount > 0) {
    return {
      label: `Hoy · ${todayCount} cupo${todayCount === 1 ? '' : 's'}`,
      tone: 'available',
    }
  }

  const next = getNextAvailableSlot({ ...base, doctorId }, today)
  if (!next) {
    return { label: 'Sin cupos próximos', tone: 'none' }
  }

  const diff = daysFromToday(next.date)
  const dayLabel =
    diff === 1 ? 'Mañana' : diff === 0 ? 'Hoy' : formatShortDate(next.date)
  return {
    label: `${dayLabel} · ${formatTime12(next.start)}`,
    tone: diff <= 1 ? 'available' : 'soon',
  }
}

function compressWeekdays(weekdays: Weekday[]): string {
  const unique = [...new Set(weekdays)].sort((a, b) => a - b)
  if (unique.length === 0) return ''
  if (
    unique.length === 5 &&
    unique.every((day, index) => day === index + 1)
  ) {
    return 'Lun – Vie'
  }
  if (
    unique.length === 6 &&
    unique.every((day, index) => day === index + 1)
  ) {
    return 'Lun – Sáb'
  }
  if (unique.length === 1) {
    return WEEKDAYS.find((day) => day.value === unique[0])?.short ?? ''
  }
  return unique
    .map((day) => WEEKDAYS.find((item) => item.value === day)?.short ?? WEEKDAY_LABELS[day])
    .join(', ')
}

export function summarizeSchedules(
  schedules: ScheduleBlock[],
  doctorId: string,
): string[] {
  const blocks = schedules.filter((block) => block.doctorId === doctorId)
  if (blocks.length === 0) return []

  const grouped = new Map<string, Weekday[]>()
  for (const block of blocks) {
    const key = `${block.start}-${block.end}`
    const days = grouped.get(key) ?? []
    days.push(block.weekday)
    grouped.set(key, days)
  }

  return [...grouped.entries()]
    .sort(([rangeA], [rangeB]) => {
      const [startA] = rangeA.split('-')
      const [startB] = rangeB.split('-')
      return timeToMinutes(startA) - timeToMinutes(startB)
    })
    .map(([range, days]) => {
      const [start, end] = range.split('-')
      return `${compressWeekdays(days)} · ${start} – ${end}`
    })
}

export function getWeekdayName(weekday: Weekday): string {
  return WEEKDAY_LABELS[weekday]
}

export function getWeekdayShort(weekday: Weekday): string {
  return WEEKDAYS.find((day) => day.value === weekday)?.short ?? ''
}

export function patientHasOverlap(
  appointments: Appointment[],
  patientId: string,
  dateISO: string,
  start: string,
  end: string,
  ignoreAppointmentId?: string,
): boolean {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  return appointments.some(
    (appointment) =>
      appointment.patientId === patientId &&
      appointment.date === dateISO &&
      appointment.status === 'confirmed' &&
      appointment.id !== ignoreAppointmentId &&
      overlaps(
        startMinutes,
        endMinutes,
        timeToMinutes(appointment.start),
        timeToMinutes(appointment.end),
      ),
  )
}

export function isDatePast(iso: string): boolean {
  return parseLocalDate(iso).getTime() < parseLocalDate(todayISO()).getTime()
}

export function isDateWithinHorizon(iso: string): boolean {
  const today = todayISO()
  return iso >= today && iso <= addDaysISO(today, BOOKING_HORIZON_DAYS)
}
