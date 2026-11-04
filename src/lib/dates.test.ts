import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Appointment } from '../types'
import {
  addDaysISO,
  canPatientCancel,
  endOfMonthISO,
  formatLongDate,
  formatTime12,
  hoursUntil,
  isPastDateTime,
  minutesToTime,
  relativeDayLabel,
  sortAppointments,
  startOfMonthISO,
  timeToMinutes,
  todayISO,
  weekdayOf,
} from './dates'

describe('conversión de horas', () => {
  it('convierte minutos a HH:mm y viceversa', () => {
    expect(timeToMinutes('09:30')).toBe(570)
    expect(minutesToTime(570)).toBe('09:30')
    expect(minutesToTime(0)).toBe('00:00')
    expect(minutesToTime(18 * 60)).toBe('18:00')
  })

  it('formatea en horario de 12 horas', () => {
    expect(formatTime12('00:00')).toBe('12:00 a. m.')
    expect(formatTime12('09:05')).toBe('9:05 a. m.')
    expect(formatTime12('12:30')).toBe('12:30 p. m.')
    expect(formatTime12('13:05')).toBe('1:05 p. m.')
    expect(formatTime12('18:00')).toBe('6:00 p. m.')
  })
})

describe('fechas ISO', () => {
  it('suma días cruzando mes y año', () => {
    expect(addDaysISO('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDaysISO('2026-02-28', 1)).toBe('2026-03-01')
  })

  it('calcula inicio y fin de mes', () => {
    expect(startOfMonthISO('2026-02-15')).toBe('2026-02-01')
    expect(endOfMonthISO('2026-02-15')).toBe('2026-02-28')
    expect(endOfMonthISO('2028-02-10')).toBe('2028-02-29')
  })

  it('obtiene el día de la semana', () => {
    expect(weekdayOf('2026-11-02')).toBe(1)
    expect(weekdayOf('2026-11-01')).toBe(0)
  })

  it('formatea una fecha larga en español', () => {
    expect(formatLongDate('2026-11-02')).toBe('Lunes 2 de noviembre')
  })
})

describe('reglas temporales', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-01T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('considera pasada una hora anterior al momento actual', () => {
    expect(isPastDateTime('2026-11-01', '11:00')).toBe(true)
    expect(isPastDateTime('2026-11-01', '12:00')).toBe(true)
    expect(isPastDateTime('2026-11-01', '13:00')).toBe(false)
  })

  it('calcula horas restantes y permite cancelar con 24 horas o más', () => {
    expect(hoursUntil('2026-11-02', '12:00')).toBe(24)
    expect(canPatientCancel('2026-11-02', '12:00')).toBe(true)
    expect(canPatientCancel('2026-11-02', '13:00')).toBe(true)
    expect(canPatientCancel('2026-11-02', '11:59')).toBe(false)
  })

  it('etiqueta hoy y mañana', () => {
    expect(todayISO()).toBe('2026-11-01')
    expect(relativeDayLabel('2026-11-01')).toBe('Hoy')
    expect(relativeDayLabel('2026-11-02')).toBe('Mañana')
  })
})

describe('sortAppointments', () => {
  it('ordena por fecha y hora ascendente', () => {
    const base = {
      patientId: 'pat_1',
      doctorId: 'doc_1',
      end: '10:00',
      reason: 'Control',
      status: 'confirmed' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const appointments: Appointment[] = [
      { ...base, id: 'apt_2', date: '2026-11-03', start: '09:00' },
      { ...base, id: 'apt_1', date: '2026-11-02', start: '11:00' },
      { ...base, id: 'apt_3', date: '2026-11-02', start: '09:30' },
    ]

    expect(appointments.sort(sortAppointments).map((item) => item.id)).toEqual([
      'apt_3',
      'apt_1',
      'apt_2',
    ])
  })
})
