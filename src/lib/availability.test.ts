import { describe, expect, it } from 'vitest'
import type { Appointment, ScheduleBlock, Weekday } from '../types'
import {
  getAvailableSlots,
  getNextAvailableSlot,
  isDateWithinHorizon,
  patientHasOverlap,
  summarizeSchedules,
} from './availability'
import { addDaysISO, todayISO, weekdayOf } from './dates'

function futureDateWithWeekday(weekday: Weekday): string {
  let date = addDaysISO(todayISO(), 2)
  for (let index = 0; index < 7; index += 1) {
    if (weekdayOf(date) === weekday) return date
    date = addDaysISO(date, 1)
  }
  throw new Error('No se encontró el día solicitado')
}

function schedule(
  id: string,
  doctorId: string,
  weekday: Weekday,
  start: string,
  end: string,
): ScheduleBlock {
  return { id, doctorId, weekday, start, end }
}

function appointment(
  id: string,
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id,
    patientId: 'pat_1',
    doctorId: 'doc_1',
    date: futureDateWithWeekday(1),
    start: '09:30',
    end: '10:00',
    reason: 'Control',
    status: 'confirmed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('getAvailableSlots', () => {
  const monday = futureDateWithWeekday(1)
  const mondaySchedule = schedule('sch_1', 'doc_1', 1, '09:00', '12:00')

  it('genera bloques de 30 minutos dentro del horario del doctor', () => {
    const slots = getAvailableSlots({
      schedules: [mondaySchedule],
      appointments: [],
      doctorId: 'doc_1',
      dateISO: monday,
    })

    expect(slots).toHaveLength(6)
    expect(slots[0]).toEqual({ start: '09:00', end: '09:30' })
    expect(slots.at(-1)).toEqual({ start: '11:30', end: '12:00' })
  })

  it('oculta el cupo ocupado por una cita confirmada', () => {
    const slots = getAvailableSlots({
      schedules: [mondaySchedule],
      appointments: [appointment('apt_1', { date: monday })],
      doctorId: 'doc_1',
      dateISO: monday,
    })

    expect(slots).toHaveLength(5)
    expect(slots.some((slot) => slot.start === '09:30')).toBe(false)
  })

  it('no bloquea cupos con citas canceladas o atendidas', () => {
    const slots = getAvailableSlots({
      schedules: [mondaySchedule],
      appointments: [
        appointment('apt_1', { date: monday, status: 'cancelled' }),
        appointment('apt_2', { date: monday, start: '10:00', end: '10:30', status: 'completed' }),
      ],
      doctorId: 'doc_1',
      dateISO: monday,
    })

    expect(slots).toHaveLength(6)
  })

  it('ignora la cita propia al reprogramar', () => {
    const current = appointment('apt_1', { date: monday })
    const slots = getAvailableSlots({
      schedules: [mondaySchedule],
      appointments: [current],
      doctorId: 'doc_1',
      dateISO: monday,
      ignoreAppointmentId: current.id,
    })

    expect(slots.some((slot) => slot.start === '09:30')).toBe(true)
  })

  it('no muestra cupos de otra fecha u otro doctor', () => {
    const slots = getAvailableSlots({
      schedules: [mondaySchedule],
      appointments: [],
      doctorId: 'doc_2',
      dateISO: addDaysISO(monday, 1),
    })

    expect(slots).toEqual([])
  })

  it('no muestra cupos de días pasados', () => {
    const slots = getAvailableSlots({
      schedules: [mondaySchedule],
      appointments: [],
      doctorId: 'doc_1',
      dateISO: addDaysISO(todayISO(), -7),
    })

    expect(slots).toEqual([])
  })

  it('elimina inicios duplicados cuando hay bloques superpuestos', () => {
    const slots = getAvailableSlots({
      schedules: [
        schedule('sch_1', 'doc_1', 1, '09:00', '10:00'),
        schedule('sch_2', 'doc_1', 1, '09:30', '10:30'),
      ],
      appointments: [],
      doctorId: 'doc_1',
      dateISO: monday,
    })

    expect(slots.map((slot) => slot.start)).toEqual(['09:00', '09:30', '10:00'])
  })
})

describe('getNextAvailableSlot', () => {
  it('encuentra el primer cupo a partir de la fecha indicada', () => {
    const start = addDaysISO(todayISO(), 2)
    const next = getNextAvailableSlot(
      {
        schedules: [1, 2, 3, 4, 5, 6].map((weekday) =>
          schedule(`sch_${weekday}`, 'doc_1', weekday as Weekday, '09:00', '10:00'),
        ),
        appointments: [],
        doctorId: 'doc_1',
      },
      start,
    )

    expect(next).toEqual({ date: start, start: '09:00', end: '09:30' })
  })

  it('devuelve null si no hay horarios configurados', () => {
    const next = getNextAvailableSlot(
      { schedules: [], appointments: [], doctorId: 'doc_1' },
      addDaysISO(todayISO(), 2),
      3,
    )

    expect(next).toBeNull()
  })
})

describe('patientHasOverlap', () => {
  const date = futureDateWithWeekday(1)

  it('detecta cruces del mismo paciente', () => {
    const result = patientHasOverlap(
      [appointment('apt_1', { date, start: '10:00', end: '10:30' })],
      'pat_1',
      date,
      '10:15',
      '10:45',
    )

    expect(result).toBe(true)
  })

  it('ignora citas canceladas, de otro paciente o la cita propia', () => {
    const appointments = [
      appointment('apt_1', { date, status: 'cancelled' }),
      appointment('apt_2', { date, patientId: 'pat_2' }),
      appointment('apt_3', { date, start: '10:00', end: '10:30' }),
    ]

    expect(patientHasOverlap(appointments, 'pat_1', date, '09:45', '10:15')).toBe(true)
    expect(
      patientHasOverlap(appointments, 'pat_1', date, '09:45', '10:15', 'apt_3'),
    ).toBe(false)
    expect(patientHasOverlap(appointments, 'pat_3', date, '09:45', '10:15')).toBe(false)
  })
})

describe('isDateWithinHorizon', () => {
  it('acepta hoy y el día 60, y rechaza ayer y el día 61', () => {
    const today = todayISO()

    expect(isDateWithinHorizon(today)).toBe(true)
    expect(isDateWithinHorizon(addDaysISO(today, 60))).toBe(true)
    expect(isDateWithinHorizon(addDaysISO(today, -1))).toBe(false)
    expect(isDateWithinHorizon(addDaysISO(today, 61))).toBe(false)
  })
})

describe('summarizeSchedules', () => {
  it('agrupa días y horarios consecutivos en una sola línea', () => {
    const schedules = [
      ...[1, 2, 3, 4, 5].map((weekday) =>
        schedule(`sch_${weekday}`, 'doc_1', weekday as Weekday, '09:00', '13:00'),
      ),
      schedule('sch_sat', 'doc_1', 6, '09:00', '12:00'),
    ]

    expect(summarizeSchedules(schedules, 'doc_1')).toEqual([
      'Lun – Vie · 09:00 – 13:00',
      'Sáb · 09:00 – 12:00',
    ])
  })

  it('devuelve una lista vacía si el doctor no tiene horarios', () => {
    expect(summarizeSchedules([], 'doc_1')).toEqual([])
  })
})
