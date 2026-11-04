import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { CANCEL_NOTICE_HOURS } from './constants'
import type { Appointment } from '../types'

export function isoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayISO(): string {
  return isoDate(new Date())
}

export function addDaysISO(iso: string, days: number): string {
  return isoDate(addDays(parseLocalDate(iso), days))
}

export function startOfMonthISO(iso: string): string {
  return isoDate(startOfMonth(parseLocalDate(iso)))
}

export function endOfMonthISO(iso: string): string {
  return isoDate(endOfMonth(parseLocalDate(iso)))
}

export function parseLocalDate(iso: string): Date {
  return parseISO(`${iso}T00:00:00`)
}

export function appointmentDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`)
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function isPastDateTime(date: string, time: string): boolean {
  return appointmentDateTime(date, time).getTime() <= Date.now()
}

export function hoursUntil(date: string, time: string): number {
  return (appointmentDateTime(date, time).getTime() - Date.now()) / 3_600_000
}

export function canPatientCancel(date: string, time: string): boolean {
  return hoursUntil(date, time) >= CANCEL_NOTICE_HOURS
}

export function daysFromToday(iso: string): number {
  return differenceInCalendarDays(parseLocalDate(iso), startOfDay(new Date()))
}

export function weekdayOf(iso: string): number {
  return parseLocalDate(iso).getDay()
}

export function sortAppointments(a: Appointment, b: Appointment): number {
  return appointmentDateTime(a.date, a.start).getTime() -
    appointmentDateTime(b.date, b.start).getTime()
}

export function formatTime12(time: string): string {
  const [rawHour, rawMinute] = time.split(':').map(Number)
  const suffix = rawHour < 12 ? 'a. m.' : 'p. m.'
  const hour = rawHour % 12 || 12
  return `${hour}:${String(rawMinute).padStart(2, '0')} ${suffix}`
}

export function formatLongDate(iso: string, withYear = false): string {
  const pattern = withYear
    ? "EEEE d 'de' MMMM 'de' yyyy"
    : "EEEE d 'de' MMMM"
  const text = format(parseLocalDate(iso), pattern, { locale: es })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatDayMonth(iso: string): { day: string; month: string } {
  return {
    day: format(parseLocalDate(iso), 'dd'),
    month: format(parseLocalDate(iso), 'MMM', { locale: es }).replace('.', ''),
  }
}

export function formatShortDate(iso: string): string {
  return format(parseLocalDate(iso), "d 'de' MMM", { locale: es })
}

export function formatMonthYear(iso: string): string {
  const text = format(parseLocalDate(iso), "MMMM 'de' yyyy", { locale: es })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function relativeDayLabel(iso: string): string {
  const diff = daysFromToday(iso)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  return formatShortDate(iso)
}

export function formatDateWithTime(date: string, time: string): string {
  return `${formatLongDate(date)} · ${formatTime12(time)}`
}

export function formatTimestamp(iso: string): string {
  return format(parseISO(iso), "d 'de' MMM, HH:mm", { locale: es })
}
